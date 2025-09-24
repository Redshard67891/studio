
import { PageHeader } from "@/components/page-header";
import { getCourseById, getEnrolledStudents } from "@/lib/data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EnrolledStudentsList } from "./enrolled-students-list";

export const dynamic = 'force-dynamic';

export default async function CourseStudentsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await getCourseById(params.courseId);
  if (!course) {
    notFound();
  }
  
  const students = await getEnrolledStudents(params.courseId);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={`${course.title} - Enrolled Students`}
        description={`A list of all students enrolled in ${course.code}.`}
        actions={
            <Button asChild variant="outline">
                <Link href="/courses">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Courses
                </Link>
            </Button>
        }
      />
      <div className="flex-1 p-6 sm:p-8">
        <EnrolledStudentsList students={students} />
      </div>
    </div>
  );
}
