'use server';

import { revalidatePath } from 'next/cache';
import type { ValidateStudentDataInput } from '@/ai/flows/validate-student-data';
import { validateStudentData } from '@/ai/flows/validate-student-data';
import { addStudent } from '@/lib/data';

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
