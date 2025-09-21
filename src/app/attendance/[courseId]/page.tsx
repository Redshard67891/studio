import { PageHeader } from "@/components/page-header";
import { getCourseById, getEnrolledStudents, getAttendanceByCourse } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceSheet } from "./attendance-sheet";
import { AttendanceSummary } from "./attendance-summary";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CourseAttendancePage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await getCourseById(params.courseId);
  if (!course) {
    notFound();
  }
  
  const students = await getEnrolledStudents(params.courseId);
  const attendanceRecords = await getAttendanceByCourse(params.courseId);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={course.title}
        description={`Manage attendance for ${course.code}`}
      />
      <div className="flex-1 p-6 sm:p-8">
        <Tabs defaultValue="mark-attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="summary">Attendance Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="mark-attendance">
            <AttendanceSheet courseId={course.id} students={students} />
          </TabsContent>
          <TabsContent value="summary">
            <AttendanceSummary students={students} records={attendanceRecords} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
