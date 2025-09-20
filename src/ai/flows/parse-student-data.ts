'use server';
/**
 * @fileOverview An AI flow to parse student data from unstructured text.
 *
 * - parseStudentDataFromText - Parses raw text to extract a list of students.
 * - ParseStudentDataInput - The input type for the flow.
 * - ParseStudentDataOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentSchema = z.object({
    studentId: z.string().describe('The unique 10-digit registration number for the student.'),
    name: z.string().describe('The full name of the student.'),
});

export const ParseStudentDataInputSchema = z.object({
    textData: z.string().describe('A raw string of text, likely copied from a spreadsheet, containing student data.'),
});
export type ParseStudentDataInput = z.infer<typeof ParseStudentDataInputSchema>;


export const ParseStudentDataOutputSchema = z.object({
  students: z.array(StudentSchema).describe('An array of student objects parsed from the text.'),
});
export type ParseStudentDataOutput = z.infer<typeof ParseStudentDataOutputSchema>;


export async function parseStudentDataFromText(input: ParseStudentDataInput): Promise<ParseStudentDataOutput> {
  return parseStudentDataFlow(input);
}


const prompt = ai.definePrompt({
    name: 'parseStudentDataPrompt',
    input: { schema: ParseStudentDataInputSchema },
    output: { schema: ParseStudentDataOutputSchema },
    prompt: `You are an expert data parsing assistant. Your task is to analyze the provided raw text, which is likely copied from a spreadsheet (e.g., Excel, Google Sheets), and convert it into a structured JSON array of student objects.

Each student object must have two properties: "studentId" and "name".

- The "studentId" is the student's registration number. It should be a string of digits.
- The "name" is the student's full name.

The input text may have headers, be separated by tabs, commas, or multiple spaces. Your job is to intelligently identify the correct columns for registration number and name and extract the data accordingly. Ignore any extra columns or empty rows.

Input Text to Parse:
{{{textData}}}
`,
});

const parseStudentDataFlow = ai.defineFlow(
  {
    name: 'parseStudentDataFlow',
    inputSchema: ParseStudentDataInputSchema,
    outputSchema: ParseStudentDataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
