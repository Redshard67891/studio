'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { importStudentsCsvAction } from './csv-import-actions';
import { useToast } from '@/hooks/use-toast';

export function CsvImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a CSV file to import.',
      });
      return;
    }

    startTransition(async () => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvData = e.target?.result as string;
        
        toast({
          title: 'Importing CSV...',
          description: 'Processing file. This may take a moment.',
        });

        try {
          const result = await importStudentsCsvAction({ csvData });
          
          toast({
            title: 'Import Complete',
            description: result.importSummary,
            duration: 8000,
          });
          
          setOpen(false);

        } catch (error) {
          console.error("CSV Import Dialog Error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unknown error occurred during import.';
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: errorMessage,
            duration: 8000,
          });
        }
      };
      reader.readAsText(file);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setFile(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Students via CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with 'Student ID' and 'Full Name' columns. The system will process the file and import the student data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isPending || !file}>
            {isPending ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
