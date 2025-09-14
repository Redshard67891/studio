import { PageHeader } from "@/components/page-header";
import { getCourses } from "@/lib/data";
import { CourseList } from "../courses/course-list";

export default async function AttendancePage() {
  const courses = await getCourses();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Attendance"
        description="Select a course to mark or view attendance records."
      />
      <div className="p-6 sm:p-8 flex-1">
        <CourseList courses={courses} />
      </div>
    </div>
  );
}
