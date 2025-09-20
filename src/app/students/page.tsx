import { PageHeader } from "@/components/page-header";
import { getStudents } from "@/lib/data";
import { AddStudentDialog } from "./add-student-dialog";
import { CsvImportDialog } from "./csv-import-dialog";
import type { Student } from "@/lib/types";
import { StudentsList } from "./students-list";

// This page is now a Server Component. It fetches data on the server.
export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  // Data is fetched on the server, so `mongodb` is not sent to the client.
  const students: Student[] = await getStudents();

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
        {/* The StudentsList component handles the client-side interactivity */}
        <StudentsList initialStudents={students} />
      </div>
    </div>
  );
}
