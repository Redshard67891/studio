'use server';

import { importStudentsWithAiAction as importStudentsFromCsvAi } from './csv-import-ai-action';
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
): Promise<{ importSummary: string, uploadErrorsDetails?: UploadErrorDetail[], skippedRecordsDetails?: any[] }> {
    
  let result: ImportStudentsOutput;
  let usedMethod: 'AI' | 'Traditional' = 'AI';

  try {
    // --- Attempt to use the AI-based import first ---
    result = await importStudentsFromCsvAi(input);
  } catch (error) {
    console.warn("CSV Import: AI import failed, attempting traditional fallback.", error);
    usedMethod = 'Traditional';

    // --- Fallback to Traditional Import ---
    try {
        const traditionalResult = await importStudentsWithTraditionalAction(input);
        return {
            ...traditionalResult,
            importSummary: `(Traditional Fallback) ${traditionalResult.importSummary}`
        };

    } catch (traditionalError) {
        console.error("CSV Import Error: Traditional import also failed.", traditionalError);
        const errorMessage = `Import failed: Both AI and traditional processing methods failed.`;
        return {
             importSummary: errorMessage,
             skippedRecordsDetails: [],
             uploadErrorsDetails: [],
        };
    }
  }

  // --- Upload Validated Students to Firestore (after successful AI processing) ---
  const uploadErrorsDetails: UploadErrorDetail[] = [];
  if (result.validatedStudents.length > 0) {
    let uploadedCount = 0;
    console.log(`CSV Import (AI): Starting Firestore upload for ${result.validatedStudents.length} valid students.`);

    for (const student of result.validatedStudents) {
      try {
        await addStudent(student);
        uploadedCount++;
      } catch (error) {
        console.error("CSV Import Error (AI): Error adding document to Firestore.", { student, error });
        uploadErrorsDetails.push({ student, error: error instanceof Error ? error.message : String(error) });
      }
    }

    const uploadFailedCount = uploadErrorsDetails.length;
    const successfullyImportedAndUploaded = uploadedCount;

    // We get the summary from the AI, and append upload status.
    result.importSummary = `${result.importSummary}. Successfully uploaded ${successfullyImportedAndUploaded} records. Failed to upload ${uploadFailedCount} records.`;

    if (uploadFailedCount > 0) {
        console.error("CSV Import Errors (AI): Firestore upload failures:", uploadErrorsDetails);
    }
    
    if (uploadedCount > 0) {
        revalidatePath('/students');
    }

  } else {
      console.warn("CSV Import (AI): No valid students found to upload to Firestore.");
  }
  
  result.importSummary = `(AI Used) ${result.importSummary}`;

  return {
      ...result,
      uploadErrorsDetails,
  };
}


// Rename the original AI action file to avoid confusion.
// This is now the dedicated AI action.
export { importStudentsFromCsv as importStudentsWithAiAction } from '@/ai/flows/import-students-from-csv';
