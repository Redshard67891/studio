"use client";

import { useState, useTransition } from "react";
import type { Student } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { bulkAddStudentsAction } from "./actions";
import { Plus, Trash2 } from "lucide-react";

// Use a temporary ID for client-side row management
type StudentRow = Partial<Omit<Student, "id">> & { tempId: number };

export function BulkAddStudentsTable() {
  const [rows, setRows] = useState<StudentRow[]>([{ tempId: 1, studentId: "", name: "" }]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleInputChange = (tempId: number, field: keyof Omit<Student, "id">, value: string) => {
    setRows(
      rows.map((row) =>
        row.tempId === tempId ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    setRows([...rows, { tempId: Date.now(), studentId: "", name: "" }]);
  };

  const removeRow = (tempId: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.tempId !== tempId));
    }
  };

  const handleSave = () => {
    startTransition(async () => {
        const studentsToSave = rows
            .map(({ tempId, ...student }) => student)
            .filter(s => s.studentId && s.name);
        
        if (studentsToSave.length === 0) {
            toast({
                variant: "destructive",
                title: "No data to save",
                description: "Please fill in at least one student's details.",
            });
            return;
        }

        const result = await bulkAddStudentsAction(studentsToSave as Omit<Student, 'id'>[]);

        if (result.success) {
            toast({
                title: "Success!",
                description: `${result.addedCount} students were added successfully.`,
            });
            setRows([{ tempId: 1, studentId: "", name: "" }]);
        } else {
            toast({
                variant: "destructive",
                title: "Error saving students",
                description: result.message || "An unknown error occurred.",
            });
        }
    });
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%] sm:w-[35%]">Registration Number</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.tempId}>
                <TableCell>
                  <Input
                    value={row.studentId || ""}
                    onChange={(e) => handleInputChange(row.tempId, "studentId", e.target.value)}
                    placeholder="e.g., 2021000001"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.name || ""}
                    onChange={(e) => handleInputChange(row.tempId, "name", e.target.value)}
                    placeholder="e.g., Jane Doe"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.tempId)}
                    disabled={rows.length <= 1}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between">
        <Button onClick={addRow} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Students"}
        </Button>
      </div>
    </div>
  );
}
