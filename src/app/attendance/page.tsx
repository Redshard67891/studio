import { PageHeader } from "@/components/page-header";
import { getCourses } from "@/lib/data";
import type { Course } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { Clock } from "lucide-react";

export default async function AttendancePage() {
  const courses = await getCourses();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Attendance"
        description="Select a course to mark or view attendance records."
      />
      <div className="p-6 sm:p-8 flex-1">
        {courses.length === 0 ? (
          <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No courses found. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: Course) => (
              <Link
                key={course.id}
                href={`/attendance/${course.id}`}
                className="block"
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{course.schedule}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
