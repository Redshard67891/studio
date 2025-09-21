'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { parseStudentDataFromText } from '@/ai/flows/parse-student-data';
import { addStudent, updateStudent, deleteStudent as dbDeleteStudent } from '@/lib/data';
import type { Student } from '@/lib/types';


const StudentSchema = z.object({
  studentId: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Registration number must be exactly 10 digits.'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .transform((name) => name.replace(/[^a-zA-Z0-9\s]/g, '')),
});

export async function createStudentAction(data: Omit<Student, 'id'>) {
  const validatedFields = StudentSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the errors.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    await addStudent(validatedFields.data);

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

const StudentUpdateSchema = StudentSchema.extend({
  id: z.string(),
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

export async function parseStudentsWithAIAction(rawData: string) {
  if (!rawData || rawData.trim() === '') {
    return {
      success: false,
      message: 'Input data is empty.',
      students: [],
    };
  }

  try {
    const result = await parseStudentDataFromText({ textData: rawData });
    return {
      success: true,
      students: result.students,
      message: 'Data parsed successfully. Please review before importing.',
    };
  } catch (error) {
    console.error('Error in parseStudentsWithAIAction:', error);
    return {
      success: false,
      message: 'The AI failed to parse the data. Please check the format or try again.',
      students: [],
    };
  }
}
