import { PageHeader } from "@/components/page-header";
import { getStudents } from "@/lib/data";
import { StudentTable } from "./student-table";
import { AddStudentDialog } from "./add-student-dialog";
import { CsvImportDialog } from "./csv-import-dialog";

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  const students = await getStudents();

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
        <StudentTable students={students} />
      </div>
    </div>
  );
}
