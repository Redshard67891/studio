'use server';
/**
 * @fileOverview A flow for importing student data from a CSV file using an LLM.
 *
 * - importStudentsFromCsv - A function that handles the student import process.
 * - ImportStudentsInput - The input type for the importStudentsFromCsv function.
 * - ImportStudentsOutput - The return type for the importStudentsFromCsv function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentDataSchema = z.object({
  name: z.string().describe('The full name of the student.'),
  studentId: z
    .string()
    .length(10, "Registration Number must be exactly 10 digits.")
    .describe('The unique 10-digit registration number for the student. Referred to as "Registration Number" or "REG NO".'),
  email: z.string().email().optional().describe('The email address of the student.'),
  major: z.string().optional().describe('The major or field of study of the student.'),
});

export const ImportStudentsInputSchema = z.object({
  csvData: z.string().describe('The raw CSV data as a string.'),
});
export type ImportStudentsInput = z.infer<typeof ImportStudentsInputSchema>;

export const ImportStudentsOutputSchema = z.object({
  validatedStudents: z
    .array(StudentDataSchema)
    .describe(
      'An array of validated and de-duplicated student data objects.'
    ),
  importSummary: z
    .string()
    .describe(
      'A summary of the import process, including the number of successful records and any errors found.'
    ),
  failureReason: z
    .string()
    .optional()
    .describe('A specific reason why the CSV could not be processed at all.'),
});
export type ImportStudentsOutput = z.infer<typeof ImportStudentsOutputSchema>;


export async function importStudentsFromCsv(
  input: ImportStudentsInput
): Promise<ImportStudentsOutput> {
  return importStudentsFromCsvFlow(input);
}


const importStudentsFromCsvPrompt = ai.definePrompt({
  name: 'importStudentsFromCsvPrompt',
  input: { schema: ImportStudentsInputSchema },
  output: { schema: ImportStudentsOutputSchema },
  prompt: `You are an expert data processor for a university. Your task is to parse a CSV file containing student data, validate it, and prepare it for import.

  Here are the rules:
  1.  **Parse the CSV data**: The data is provided in a raw string format. Identify the columns, even if the headers are messy, missing, or in a different order. The key fields to look for are 'Name' and 'Registration Number' (which might be labeled as 'studentId', 'REG NO', 'ID', etc.). 'Email' and 'Major' are optional.
  2.  **Required Fields**: A record is only valid if it contains a 'Name' and a 'Registration Number'.
  3.  **Validate Registration Number**: The 'Registration Number' must be exactly 10 digits. Clean up any non-digit characters. If a cleaned number is not 10 digits, the record is invalid.
  4.  **Handle Duplicates**: If you find multiple rows with the same 'Name' or 'Registration Number', only keep the first one you encounter. Discard all subsequent duplicates.
  5.  **Summarize**: Provide a final import summary, detailing how many records were successfully processed and how many were skipped due to being invalid or duplicates.
  6.  **Output**: Return a list of the validated, de-duplicated students and the import summary. If the entire CSV is un-processable, provide a failure reason.

  Here is the CSV data:
  {{{csvData}}}
  `,
});

const importStudentsFromCsvFlow = ai.defineFlow(
  {
    name: 'importStudentsFromCsvFlow',
    inputSchema: ImportStudentsInputSchema,
    outputSchema: ImportStudentsOutputSchema,
  },
  async (input) => {
    if (!input.csvData || input.csvData.trim() === '') {
      return {
        validatedStudents: [],
        importSummary: 'Import failed.',
        failureReason:
          'The provided CSV file is empty or does not contain any data.',
      };
    }
    const { output } = await importStudentsFromCsvPrompt(input);
    return output!;
  }
);
