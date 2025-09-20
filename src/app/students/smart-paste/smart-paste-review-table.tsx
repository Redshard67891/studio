"use client";

import type { Student } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

type StudentRow = Omit<Student, 'id'> & { tempId: number };

interface SmartPasteReviewTableProps {
  students: StudentRow[];
  onUpdate: (tempId: number, field: keyof Omit<Student, 'id'>, value: string) => void;
}

export function SmartPasteReviewTable({ students, onUpdate }: SmartPasteReviewTableProps) {
  return (
    <div className="border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Registration Number</TableHead>
            <TableHead>Full Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.tempId}>
              <TableCell>
                <Input
                  value={student.studentId || ""}
                  onChange={(e) => onUpdate(student.tempId, "studentId", e.target.value)}
                  placeholder="e.g., 2021000001"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={student.name || ""}
                  onChange={(e) => onUpdate(student.tempId, "name", e.target.value)}
                  placeholder="e.g., Jane Doe"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
