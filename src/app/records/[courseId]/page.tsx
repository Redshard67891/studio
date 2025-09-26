
import { PageHeader } from "@/components/page-header";
import { getCourseById, getAttendanceSessionsForCourse } from "@/lib/data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


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
        {sessions.length === 0 ? (
          <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No attendance records found for this course.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((timestamp) => (
                <Link key={timestamp} href={`/records/${course.id}/${encodeURIComponent(timestamp)}`} className="block">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between p-4">
                            <CardTitle className="text-lg">
                                {new Date(timestamp).toLocaleString(undefined, { 
                                    dateStyle: 'medium', 
                                    timeStyle: 'short' 
                                })}
                            </CardTitle>
                             <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                    </Card>
                </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
