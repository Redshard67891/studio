"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addCourse } from "@/lib/data";

const CourseSchema = z.object({
  code: z.string().min(1, "Course code is required"),
  title: z.string().min(1, "Course title is required"),
  schedule: z.string().min(1, "Schedule is required"),
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
