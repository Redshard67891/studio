import { PageHeader } from "@/components/page-header";
import { getCourses, getRichAttendanceRecords } from "@/lib/data";
import { RecordsClientPage } from "./records-client-page";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  // Fetch initial records for the last 30 days
  const initialFilters = {
    courseId: "all",
    studentQuery: "",
    status: "all" as const,
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date(),
    }
  }
  const records = await getRichAttendanceRecords(initialFilters);
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
