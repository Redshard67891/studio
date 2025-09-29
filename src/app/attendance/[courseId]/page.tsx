import { PageHeader } from "@/components/page-header";
import { getCourseById, getEnrolledStudents } from "@/lib/data";
import { AttendanceSheet } from "./attendance-sheet";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart2, Download } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AttendanceSummary } from "./attendance-summary";
import { getAttendanceByCourse } from "@/lib/data";


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
        actions={
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                 <Button variant="outline">
                  <BarChart2 className="mr-2 h-4 w-4" /> View Summary
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Attendance Summary</SheetTitle>
                  <SheetDescription>
                    Review the overall attendance for {course.title}.
                  </SheetDescription>
                </SheetHeader>
                 <div className="mt-4">
                  <AttendanceSummary students={students} records={attendanceRecords} />
                </div>
              </SheetContent>
            </Sheet>
             <Button asChild variant="outline">
                <Link href="/attendance">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Courses
                </Link>
            </Button>
          </div>
        }
      />
      <div className="flex-1 p-6 sm:p-8">
        <AttendanceSheet course={course} students={students} />
      </div>
    </div>
  );
}
