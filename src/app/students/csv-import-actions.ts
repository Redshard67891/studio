'use server';

import { importStudentsFromCsv } from '@/ai/flows/import-students-from-csv';
import { importStudentsWithTraditionalAction } from './csv-import-traditional-action';
import type { ImportStudentsInput, ImportStudentsOutput } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { addStudent } from '@/lib/data';

type UploadErrorDetail = {
  student: any;
  error: string;
};

// This is the primary server action the client will call.
export async function importStudentsCsvAction(
  input: ImportStudentsInput
): Promise<
  { importSummary: string } & Partial<Omit<ImportStudentsOutput, 'importSummary'>> & {
    uploadErrorsDetails?: UploadErrorDetail[];
  }
> {
  try {
    let result: ImportStudentsOutput;
    let usedMethod: 'AI' | 'Traditional' = 'AI';

    try {
      // --- Attempt to use the AI-based import first ---
      result = await importStudentsFromCsv(input);
    } catch (error) {
      console.warn(
        'CSV Import: AI import failed, attempting traditional fallback.',
        error
      );
      usedMethod = 'Traditional';

      // --- Fallback to Traditional Import ---
      const traditionalResult = await importStudentsWithTraditionalAction(input);
      result = {
        validatedStudents: traditionalResult.validatedStudents,
        importSummary: `(Traditional Fallback) ${traditionalResult.importSummary}`,
        failureReason: traditionalResult.failureReason,
      };
    }

    // --- Upload Validated Students to Firestore (after successful processing) ---
    const uploadErrorsDetails: UploadErrorDetail[] = [];
    if (result.validatedStudents.length > 0) {
      let uploadedCount = 0;
      console.log(
        `CSV Import (${usedMethod}): Starting Firestore upload for ${result.validatedStudents.length} valid students.`
      );

      for (const student of result.validatedStudents) {
        try {
          await addStudent(student);
          uploadedCount++;
        } catch (error) {
          console.error(
            `CSV Import Error (${usedMethod}): Error adding document to Firestore.`,
            { student, error }
          );
          uploadErrorsDetails.push({
            student,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const uploadFailedCount = uploadErrorsDetails.length;
      const successfullyImportedAndUploaded = uploadedCount;

      result.importSummary = `${result.importSummary}. Successfully uploaded ${successfullyImportedAndUploaded} records. Failed to upload ${uploadFailedCount} records.`;

      if (uploadFailedCount > 0) {
        console.error(
          `CSV Import Errors (${usedMethod}): Firestore upload failures:`,
          uploadErrorsDetails
        );
      }

      if (uploadedCount > 0) {
        revalidatePath('/students');
      }
    } else {
      console.warn(`CSV Import (${usedMethod}): No valid students found to upload to Firestore.`);
    }

    result.importSummary = `(${usedMethod} Used) ${result.importSummary}`;

    return {
      ...result,
      uploadErrorsDetails,
    };
  } catch (e) {
    console.error('[CRITICAL] Unhandled error in importStudentsCsvAction:', e);
    return {
      validatedStudents: [],
      importSummary: 'Import failed due to an unexpected server error.',
      failureReason: 'An unexpected error occurred. Please check the server logs for more details.',
      uploadErrorsDetails: [],
    };
  }
}
