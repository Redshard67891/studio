
import { PageHeader } from "@/components/page-header";
import { getCourseById, getEnrolledStudents } from "@/lib/data";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        <Card>
            <CardContent className="p-0">
                 <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Registration Number</TableHead>
                            <TableHead>Student Name</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {students.length > 0 ? (
                            students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.studentId}</TableCell>
                                <TableCell>{student.name}</TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center">
                                No students are enrolled in this course yet.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
