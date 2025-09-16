'use server';

import { addStudent } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { importStudentsFromCsv } from '@/ai/flows/import-students-from-csv';
import type { ImportStudentsInput, ImportStudentsOutput } from '@/lib/types';

/**
 * An AI-powered action to import and validate students from a CSV string.
 */
export async function importStudentsWithAiAction(
  input: ImportStudentsInput
): Promise<Omit<ImportStudentsOutput, 'validatedStudents'>> {
  const result = await importStudentsFromCsv(input);

  // Throw an error to trigger fallback if AI fails for any reason
  if (result.failureReason) {
    throw new Error(result.failureReason);
  }

  const studentsToAdd = result.validatedStudents;

  if (studentsToAdd.length === 0) {
    return {
      importSummary:
        result.importSummary ||
        'AI processing completed, but no valid student records were found to import.',
    };
  }

  // Add all valid students to the database
  try {
    const addPromises = studentsToAdd.map((student) => addStudent(student));
    await Promise.all(addPromises);
  } catch (error) {
    throw new Error('An error occurred while saving students to the database.');
  }

  revalidatePath('/students');

  return {
    importSummary: result.importSummary,
  };
}
