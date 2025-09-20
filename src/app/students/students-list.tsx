"use client";

import { useState, useEffect } from "react";
import type { Student } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { StudentTable } from "./student-table";

// This new client component handles the state for searching and filtering.
export function StudentsList({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");

  // When the initialStudents prop changes (e.g., after a revalidation), update the state.
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Filter students whenever the search query or the base list of students changes.
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
    <>
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
    </>
  );
}
