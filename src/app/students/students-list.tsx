
"use client";

import { useState, useEffect, useTransition } from "react";
import type { Student } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Plus, Wand2, Upload, ListPlus, UserPlus } from "lucide-react";
import { StudentTable } from "./student-table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { deleteStudentAction } from "./actions";
import { EditStudentForm } from "./edit-student-form";
import { PageHeader } from "@/components/page-header";
import { CsvImportDialog } from "./csv-import-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddStudentDialog } from "./add-student-dialog";
import Link from "next/link";


const PAGE_SIZE = 5;

// This client component handles the state for all student list interactions.
export function StudentsList({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // State for dialogs
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // When the initialStudents prop changes (after revalidation), update the state.
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

  // Handlers for opening dialogs
  const handleEditClick = (student: Student) => {
    setStudentToEdit(student);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  // Handler for confirming deletion
  const handleDeleteConfirm = () => {
    if (!studentToDelete) return;
    startTransition(async () => {
      const result = await deleteStudentAction(studentToDelete.id);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        setIsDeleteDialogOpen(false);
        setStudentToDelete(null);
        // Data will be revalidated by the server action, no need to manually update state
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Students"
        description="Create and manage individual student records."
        actions={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Students{" "}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AddStudentDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Single Student
                  </DropdownMenuItem>
                </AddStudentDialog>
                <DropdownMenuItem asChild>
                  <Link href="/students/bulk-add">
                    <ListPlus className="mr-2 h-4 w-4" />
                    Add in Bulk
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/students/smart-paste">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Smart Paste (AI)
                  </Link>
                </DropdownMenuItem>
                 <CsvImportDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Upload className="mr-2 h-4 w-4" />
                       Import CSV
                    </DropdownMenuItem>
                 </CsvImportDialog>
              </DropdownMenuContent>
            </DropdownMenu>
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
        <StudentTable 
          students={paginatedStudents} 
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
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
      </div>


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student record for <span className="font-semibold">{studentToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the details for the student.
            </DialogDescription>
          </DialogHeader>
          {studentToEdit && (
            <EditStudentForm
              student={studentToEdit}
              onFinished={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
