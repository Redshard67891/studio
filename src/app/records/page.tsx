
import { PageHeader } from "@/components/page-header";
import { getCoursesWithAttendance } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const courses = await getCoursesWithAttendance();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Attendance Records"
        description="Select a course to view its attendance history."
      />
      <div className="p-6 sm:p-8 flex-1">
        {courses.length === 0 ? (
          <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No attendance records found for any course.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/records/${course.id}`}
                className="block"
              >
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between p-4">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.code}</CardDescription>
                    </div>
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
