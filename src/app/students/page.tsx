import { PageHeader } from "@/components/page-header";
import { getStudents } from "@/lib/data";
import type { Student } from "@/lib/types";
import { StudentsList } from "./students-list";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students: Student[] = await getStudents();

  return (
    <div className="flex flex-col h-full">
      <StudentsList initialStudents={students} />
    </div>
  );
}
