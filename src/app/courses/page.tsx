"use client";

import { useState, useTransition, useEffect } from "react";
import type { Course } from "@/lib/types";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddCourseForm } from "./add-course-form";
import { useToast } from "@/hooks/use-toast";
import { deleteCourseAction } from "./actions";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching courses",
          description: "Could not load course data. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, [toast, isPending]); // Rerun when a course is deleted

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!courseToDelete) return;
    startTransition(async () => {
      const result = await deleteCourseAction(courseToDelete.id);
      if (result.success) {
        toast({ title: "Success", description: result.message });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader
          title="Courses"
          description="Create and manage course data, codes, titles, and schedules."
        />
        <div className="p-6 sm:p-8 flex-1">
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
          <CourseList courses={courses} onDelete={handleDeleteClick} />
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course <span className="font-semibold">{courseToDelete?.title}</span> and
              all of its associated attendance records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCourseToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
