"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addCourse, updateCourse, deleteCourse as dbDeleteCourse } from "@/lib/data";
import { ObjectId } from "mongodb";

const CourseSchema = z.object({
  code: z.string().min(1, "Course code is required"),
  title: z.string().min(1, "Course title is required"),
  schedule: z.string().min(1, "Schedule is required"),
});

const CourseUpdateSchema = CourseSchema.extend({
  id: z.string(),
});


export async function createCourseAction(data: z.infer<typeof CourseSchema>) {
  const validatedFields = CourseSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addCourse(validatedFields.data);
    revalidatePath("/courses");
    return {
      success: true,
      message: "Course created successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while creating the course.",
    };
  }
}

export async function updateCourseAction(data: z.infer<typeof CourseUpdateSchema>) {
  const validatedFields = CourseUpdateSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { id, ...courseData } = validatedFields.data;
    await updateCourse(id, courseData);
    revalidatePath('/courses');
    return {
      success: true,
      message: "Course updated successfully!",
    };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error('Error in updateCourseAction:', error);
    return {
      success: false,
      message: errorMessage,
    };
  }
}


export async function deleteCourseAction(id: string) {
  if (!id || !ObjectId.isValid(id)) {
    return {
      success: false,
      message: 'Invalid course ID.',
    };
  }
  
  try {
    await dbDeleteCourse(id);
    revalidatePath('/courses');
    return {
      success: true,
      message: 'Course and all associated attendance have been deleted.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error('Error in deleteCourseAction:', error);
    return {
      success: false,
      message: errorMessage,
    };
  }
}
