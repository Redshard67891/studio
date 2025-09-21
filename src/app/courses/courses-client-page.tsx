
"use client";

import { useState, useTransition, useEffect } from "react";
import type { Course } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { EditCourseForm } from "./edit-course-form";


export function CoursesClientPage({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);


  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditClick = (course: Course) => {
    setCourseToEdit(course);
    setIsEditDialogOpen(true);
  }

  const handleEnrollClick = (course: Course) => {
    // TODO: Implement Enroll Dialog
    toast({ title: "Coming Soon!", description: "Enrolling students will be available soon." });
  }

  const handleDeleteConfirm = () => {
    if (!courseToDelete) return;
    startTransition(async () => {
      const result = await deleteCourseAction(courseToDelete.id);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        // Server action revalidates, so useEffect will update the courses
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
          <CourseList 
            courses={courses} 
            onDelete={handleDeleteClick}
            onEdit={handleEditClick}
            onEnroll={handleEnrollClick}
          />
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
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the details for the course.
            </DialogDescription>
          </DialogHeader>
          {courseToEdit && (
            <EditCourseForm
              course={courseToEdit}
              onFinished={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
