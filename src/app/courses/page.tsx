import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCourses } from "@/lib/data";
import { CourseList } from "./course-list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddCourseForm } from "./add-course-form";

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Courses"
        description="Create and manage course data, defining codes, titles, and schedules."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new course.
                </DialogDescription>
              </DialogHeader>
              <AddCourseForm />
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-6 sm:p-8 flex-1">
        <CourseList courses={courses} />
      </div>
    </div>
  );
}
