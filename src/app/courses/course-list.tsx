
"use client";

import type { Course } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, MoreVertical, Trash2, UserPlus, Pencil, ClipboardCheck } from "lucide-react";

type CourseListProps = {
  courses: Course[];
  onDelete: (course: Course) => void;
  onEdit: (course: Course) => void;
  onEnroll: (course: Course) => void;
};

export function CourseList({ courses, onDelete, onEdit, onEnroll }: CourseListProps) {
  if (courses.length === 0) {
    return <p>No courses found. Create one to get started!</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.code}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEnroll(course)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Enroll Students
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href={`/attendance/${course.id}`} className="flex items-center">
                       <ClipboardCheck className="mr-2 h-4 w-4" />
                       Manage Attendance
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(course)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Info
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(course)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              <span>{course.schedule}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
