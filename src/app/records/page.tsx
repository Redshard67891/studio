import { PageHeader } from "@/components/page-header";
import { getCourses, getRichAttendanceRecords } from "@/lib/data";
import { RecordsClientPage } from "./records-client-page";

export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const records = await getRichAttendanceRecords();
  const courses = await getCourses();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Attendance Records"
        description="View and filter all attendance data across all courses."
      />
      <div className="p-6 sm:p-8 flex-1">
        <RecordsClientPage initialRecords={records} courses={courses} />
      </div>
    </div>
  );
}