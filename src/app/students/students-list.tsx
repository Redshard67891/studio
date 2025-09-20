"use client";

import { useState, useEffect } from "react";
import type { Student } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { StudentTable } from "./student-table";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 5;

// This new client component handles the state for searching and filtering.
export function StudentsList({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // When the initialStudents prop changes (e.g., after a revalidation), update the state.
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Filter students whenever the search query or the base list of students changes.
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };


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
      <StudentTable students={paginatedStudents} />
      <div className="flex items-center justify-end space-x-2 py-4">
        <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
    </>
  );
}
