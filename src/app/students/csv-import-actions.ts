"use server";

import { addStudent } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { importStudentsFromCsv } from "@/ai/flows/import-students-from-csv";
import type { ImportStudentsInput, ImportStudentsOutput } from "@/lib/types";


/**
 * An AI-powered action to import and validate students from a CSV string.
 */
export async function importStudentsWithAiAction(
  input: ImportStudentsInput
): Promise<Omit<ImportStudentsOutput, 'validatedStudents'>> {
  
  const result = await importStudentsFromCsv(input);

  if (result.failureReason) {
    return {
      importSummary: "Import failed.",
      failureReason: result.failureReason,
    };
  }
  
  const studentsToAdd = result.validatedStudents;

  if (studentsToAdd.length === 0 && !result.failureReason) {
    return {
        importSummary: result.importSummary || "No valid student records were found to import.",
    };
  }

  // Add all valid students to the database
  try {
    const addPromises = studentsToAdd.map(student => addStudent(student));
    await Promise.all(addPromises);
  } catch (error) {
    return {
      importSummary: "Import failed.",
      failureReason: "An error occurred while saving students to the database.",
    };
  }
  
  revalidatePath("/students");

  return {
    importSummary: result.importSummary,
  };
}
