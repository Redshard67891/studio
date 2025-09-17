'use server';

import { revalidatePath } from 'next/cache';
import { addStudent } from '@/lib/data';
import type { ImportStudentsInput, ImportStudentsOutput } from '@/lib/types';
import { importStudentsWithTraditionalAction } from './csv-import-traditional-action';

type UploadErrorDetail = {
  student: any;
  error: string;
};

// This is the primary server action the client will call.
export async function importStudentsCsvAction(
  input: ImportStudentsInput
): Promise<
  ImportStudentsOutput & {
    uploadErrorsDetails?: UploadErrorDetail[];
  }
> {
  try {
    // --- Step 1: Process the CSV using the traditional parser ---
    const result = await importStudentsWithTraditionalAction(input);

    // If parsing/validation failed fundamentally, return the result immediately.
    if (result.failureReason) {
      return {
        ...result,
        uploadErrorsDetails: [],
      };
    }

    // --- Step 2: Upload Validated Students to Firestore ---
    const uploadErrorsDetails: UploadErrorDetail[] = [];
    let uploadedCount = 0;

    if (result.validatedStudents.length > 0) {
      console.log(
        `CSV Import: Starting Firestore upload for ${result.validatedStudents.length} valid students.`
      );

      for (const student of result.validatedStudents) {
        try {
          await addStudent(student);
          uploadedCount++;
        } catch (error) {
          console.error(
            `CSV Import Error: Error adding document to Firestore.`,
            { student, error }
          );
          uploadErrorsDetails.push({
            student,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (uploadedCount > 0) {
        revalidatePath('/students');
      }
    }

    // --- Step 3: Construct the Final Comprehensive Summary ---
    const uploadFailedCount = uploadErrorsDetails.length;
    const validationSkippedCount = result.skippedRecordsDetails?.length || 0;
    const finalSummary = `Import complete. Successfully uploaded ${uploadedCount} records. Skipped ${validationSkippedCount} records during validation. Failed to upload ${uploadFailedCount} records.`;

    if (uploadFailedCount > 0) {
      console.error(
        'CSV Import Errors: Firestore upload failures:',
        uploadErrorsDetails
      );
    }
    
    return {
      ...result,
      importSummary: finalSummary,
      uploadErrorsDetails,
    };

  } catch (error) {
    console.error('[CRITICAL] Unhandled error in importStudentsCsvAction:', error);
    return {
      validatedStudents: [],
      importSummary: 'Import failed due to an unexpected server error.',
      failureReason: 'An unexpected error occurred. Please check the server logs for more details.',
      uploadErrorsDetails: [],
    };
  }
}
