"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { addStudent } from "@/lib/data";
import type { Student } from "@/lib/types";

const StudentSchema = z.object({
  studentId: z.string().min(1, "Registration number is required."),
  name: z.string().min(1, "Name is required."),
});

const BulkAddStudentsSchema = z.array(StudentSchema);

export async function bulkAddStudentsAction(
  studentsData: Omit<Student, "id">[]
) {
  const validationResult = BulkAddStudentsSchema.safeParse(studentsData);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation failed. Please ensure all rows have a name and registration number.",
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    let addedCount = 0;
    for (const student of validationResult.data) {
      await addStudent(student);
      addedCount++;
    }

    if (addedCount > 0) {
      revalidatePath("/students");
    }

    return {
      success: true,
      message: `Successfully added ${addedCount} students.`,
      addedCount,
    };
  } catch (error) {
    console.error("Error in bulkAddStudentsAction:", error);
    return {
      success: false,
      message: "An error occurred while saving the students.",
    };
  }
}
