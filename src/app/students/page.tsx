import { PageHeader } from "@/components/page-header";
import { getStudents } from "@/lib/data";
import { AddStudentDialog } from "./add-student-dialog";
import { CsvImportDialog } from "./csv-import-dialog";
import type { Student } from "@/lib/types";
import { StudentsList } from "./students-list";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { AddBulkStudentsButton } from "./add-bulk-students-button";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students: Student[] = await getStudents();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Students"
        description="Create and manage individual student records."
        actions={
          <div className="flex gap-2">
            <CsvImportDialog />
            <AddStudentDialog>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Student
                </Button>
            </AddStudentDialog>
            <AddBulkStudentsButton />
          </div>
        }
      />
      <div className="p-6 sm:p-8 flex-1">
        <StudentsList initialStudents={students} />
      </div>
    </div>
  );
}
