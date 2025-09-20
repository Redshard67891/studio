'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import type { ValidateStudentDataInput } from '@/ai/flows/validate-student-data';
import { validateStudentData } from '@/ai/flows/validate-student-data';
import { addStudent, updateStudent, deleteStudent as dbDeleteStudent } from '@/lib/data';
import type { Student } from '@/lib/types';


export async function createStudentAction(data: ValidateStudentDataInput) {
  try {
    const validationResult = await validateStudentData(data);

    if (!validationResult.isValid) {
      return {
        success: false,
        message: 'AI validation failed. Please review the suggested corrections.',
        errors: validationResult.validationErrors,
        correctedData: validationResult.correctedData,
      };
    }

    const studentData = validationResult.correctedData || data;
    await addStudent(studentData);

    revalidatePath('/students');
    return {
      success: true,
      message: 'Student added successfully!',
    };
  } catch (error) {
    console.error('Error in createStudentAction:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while adding the student.',
    };
  }
}

export async function createStudentWithCorrection(
  data: ValidateStudentDataInput
) {
  try {
    // Even with correction, we should re-validate.
    const validationResult = await validateStudentData(data);

    if (!validationResult.isValid) {
      // This case should ideally not be hit if the user is correcting data,
      // but as a safeguard, we handle it.
      return {
        success: false,
        message: 'Corrected data is still invalid. Please review.',
        errors: validationResult.validationErrors,
        correctedData: validationResult.correctedData,
      };
    }

    const studentData = validationResult.correctedData || data;
    await addStudent(studentData);

    revalidatePath('/students');
    return {
      success: true,
      message: 'Student added with corrected data!',
    };
  } catch (error) {
    console.error('Error in createStudentWithCorrection:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while adding the student.',
    };
  }
}

const StudentUpdateSchema = z.object({
  id: z.string(),
  studentId: z.string().min(1, "Registration Number is required"),
  name: z.string().min(1, "Name is required"),
});

export async function updateStudentAction(data: z.infer<typeof StudentUpdateSchema>) {
  const validatedFields = StudentUpdateSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { id, ...studentData } = validatedFields.data;
    await updateStudent(id, studentData);
    revalidatePath('/students');
    return {
      success: true,
      message: "Student updated successfully!",
    };
  } catch (error) {
    console.error('Error in updateStudentAction:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while updating the student.',
    };
  }
}

export async function deleteStudentAction(id: string) {
  if (!id || !ObjectId.isValid(id)) {
    return {
      success: false,
      message: 'Invalid student ID.',
    };
  }
  
  try {
    await dbDeleteStudent(id);
    revalidatePath('/students');
    return {
      success: true,
      message: 'Student deleted successfully!',
    };
  } catch (error) {
    console.error('Error in deleteStudentAction:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the student.',
    };
  }
}
