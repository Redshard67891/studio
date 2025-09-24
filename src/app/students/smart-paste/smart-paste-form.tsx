"use client";

import { useState, useTransition } from "react";
import type { Student } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Wand2, Import } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseStudentsWithAIAction } from "../actions";
import { bulkAddStudentsAction } from "../bulk-add/actions";
import { SmartPasteReviewTable } from "./smart-paste-review-table";

type StudentRow = Omit<Student, 'id'> & { tempId: number };

export function SmartPasteForm() {
  const [rawData, setRawData] = useState("");
  const [parsedStudents, setParsedStudents] = useState<StudentRow[]>([]);
  const [isParsing, startParsingTransition] = useTransition();
  const [isImporting, startImportingTransition] = useTransition();
  const { toast } = useToast();

  const handleProcessData = () => {
    startParsingTransition(async () => {
      const result = await parseStudentsWithAIAction(rawData);
      if (result.success) {
        toast({
          title: "Parsing Complete",
          description: result.message,
        });
        setParsedStudents(result.students.map((s, i) => ({ ...s, tempId: i })));
      } else {
        toast({
          variant: "destructive",
          title: "Parsing Failed",
          description: result.message,
        });
        setParsedStudents([]);
      }
    });
  };

  const handleImportData = () => {
    startImportingTransition(async () => {
        const studentsToSave = parsedStudents.map(({ tempId, ...student }) => student);
        const result = await bulkAddStudentsAction(studentsToSave);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            setRawData("");
            setParsedStudents([]);
        } else {
            toast({
                variant: "destructive",
                title: "Import Failed",
                description: result.message || "An unknown error occurred.",
            });
        }
    });
  };
  
  const updateStudent = (tempId: number, field: keyof Omit<Student, 'id'>, value: string) => {
    setParsedStudents(prev => 
        prev.map(s => s.tempId === tempId ? { ...s, [field]: value } : s)
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Paste Your Data</CardTitle>
          <CardDescription>
            Copy columns from Excel, Google Sheets, or a CSV file and paste them into the text area below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g.&#10;2021000001  Alice Johnson&#10;2021000002  Bob Williams"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            rows={8}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleProcessData} disabled={isParsing || !rawData}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isParsing ? "Parsing with AI..." : "Parse Data"}
          </Button>
        </CardFooter>
      </Card>

      {parsedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Review and Import</CardTitle>
            <CardDescription>
              Review the data parsed by the AI. You can make corrections in the table before importing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SmartPasteReviewTable students={parsedStudents} onUpdate={updateStudent} />
          </CardContent>
          <CardFooter>
            <Button onClick={handleImportData} disabled={isImporting}>
              <Import className="mr-2 h-4 w-4" />
              {isImporting ? "Importing..." : `Import ${parsedStudents.length} Students`}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
