import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Users, Book, BarChart } from "lucide-react";
import Link from "next/link";
import { getStudents, getCourses, getOverallAttendanceRateForLastWeek } from "@/lib/data";

export default async function DashboardPage() {
  const students = await getStudents();
  const courses = await getCourses();
  const attendanceRate = await getOverallAttendanceRateForLastWeek();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Dashboard"
        description="Welcome to AttendEase. Here's a quick overview."
      />
      <div className="p-6 sm:p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              <Link
                href="/students"
                className="font-medium text-primary hover:underline"
              >
                Manage students
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <Book className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              <Link
                href="/courses"
                className="font-medium text-primary hover:underline"
              >
                Manage courses
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Overview
            </CardTitle>
            <BarChart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average attendance rate this week
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
