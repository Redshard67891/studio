"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { getStudents } from "@/lib/data";
import { StudentTable } from "./student-table";
import { AddStudentDialog } from "./add-student-dialog";
import { CsvImportDialog } from "./csv-import-dialog";
import type { Student } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// This page now needs to be a client component to manage search state.
// We'll fetch data in a client component for simplicity here.
// For larger apps, consider a different pattern or server-side filtering.
import { useEffect } from "react";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      const allStudents = await getStudents();
      setStudents(allStudents);
      setFilteredStudents(allStudents);
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowercasedQuery) ||
        student.studentId.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Students"
        description="Create and manage individual student records."
        actions={
          <div className="flex gap-2">
            <CsvImportDialog />
            <AddStudentDialog />
          </div>
        }
      />
      <div className="p-6 sm:p-8 flex-1">
        <div className="mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search students..."
                    className="pl-10 w-full md:w-1/3"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
        <StudentTable students={filteredStudents} />
      </div>
    </div>
  );
}
