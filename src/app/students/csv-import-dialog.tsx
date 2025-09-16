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
import { importStudentsWithAiAction } from './csv-import-actions';
import { importStudentsWithTraditionalAction } from './csv-import-traditional-action';
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
        try {
          // --- AI First Approach ---
          toast({
            title: 'Processing with AI...',
            description: 'Attempting to intelligently parse your CSV file.',
          });
          const result = await importStudentsWithAiAction({ csvData });
          toast({
            title: 'Import Complete (AI)',
            description: result.importSummary,
            duration: 5000,
          });
          setOpen(false);
        } catch (aiError) {
          // --- Fallback to Traditional Method ---
          console.warn('AI import failed, falling back to traditional import:', aiError);
          toast({
            title: 'AI Failed, Using Fallback',
            description:
              'Falling back to the standard CSV import method.',
            variant: 'default',
          });
          try {
            const result = await importStudentsWithTraditionalAction({
              csvData,
            });
            toast({
              title: 'Import Complete (Fallback)',
              description: result.importSummary,
              duration: 5000,
            });
            setOpen(false);
          } catch (traditionalError) {
            const errorMessage =
              traditionalError instanceof Error
                ? traditionalError.message
                : 'An unknown error occurred during fallback import.';
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: errorMessage,
              duration: 5000,
            });
          }
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
            Upload a CSV file. The AI will try to parse it. If it fails, a
            standard parser will be used as a fallback.
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
