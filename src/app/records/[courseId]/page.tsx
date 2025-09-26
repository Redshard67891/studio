
import { PageHeader } from "@/components/page-header";
import { getCourseById, getAttendanceSessionsForCourse } from "@/lib/data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SessionsClientPage } from "./sessions-client-page";


export const dynamic = 'force-dynamic';

export default async function CourseRecordsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await getCourseById(params.courseId);
  if (!course) {
    notFound();
  }
  
  const sessions = await getAttendanceSessionsForCourse(params.courseId);


  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={`${course.title} - Sessions`}
        description="Select a session to view its attendance records."
        actions={
          <div className="flex items-center gap-2">
             <Button asChild variant="outline">
                <Link href="/records">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Courses
                </Link>
            </Button>
          </div>
        }
      />
      <div className="flex-1 p-6 sm:p-8">
        <SessionsClientPage courseId={course.id} initialSessions={sessions} />
      </div>
    </div>
  );
}
