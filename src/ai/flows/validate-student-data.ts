/**
 * @fileOverview Data validation flow for student records using an LLM.
 *
 * This flow is kept for reference or future use but is no longer the primary
 * validation method for single student entry.
 *
 * - validateStudentData - A function that validates and corrects student data entries.
 * - ValidateStudentDataInput - The input type for the validateStudentData function.
 * - ValidateStudentDataOutput - The return type for the validateStudentData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ValidateStudentDataInputSchema = z.object({
  studentId: z.string().describe('The unique registration number for the student, must be 10 digits.'),
  name: z.string().describe('The full name of the student.'),
});
export type ValidateStudentDataInput = z.infer<typeof ValidateStudentDataInputSchema>;

const ValidateStudentDataOutputSchema = z.object({
  isValid: z.boolean().describe('Indicates whether the student data is valid and consistent.'),
  correctedData: ValidateStudentDataInputSchema.optional().describe('The corrected student data, if any.'),
  validationErrors: z.array(z.string()).optional().describe('List of validation errors found in the data.'),
});
export type ValidateStudentDataOutput = z.infer<typeof ValidateStudentDataOutputSchema>;

export async function validateStudentData(input: ValidateStudentDataInput): Promise<ValidateStudentDataOutput> {
  return validateStudentDataFlow(input);
}

const validateStudentDataPrompt = ai.definePrompt({
  name: 'validateStudentDataPrompt',
  input: {schema: ValidateStudentDataInputSchema},
  output: {schema: ValidateStudentDataOutputSchema},
  prompt: `You are an expert data validator for a university attendance system. Your task is to validate the provided student data and correct any inconsistencies or errors.

  Here is the student data:
  Registration Number: {{{studentId}}}
  Name: {{{name}}}

  Determine if the data is valid and consistent. The registration number must be exactly 10 digits. The name should not contain special characters. If there are errors, correct them and provide a list of validation errors. If the data is valid, indicate that the data is valid and consistent.

  Return corrected data with all the original fields if there are errors.
`,
});

const validateStudentDataFlow = ai.defineFlow(
  {
    name: 'validateStudentDataFlow',
    inputSchema: ValidateStudentDataInputSchema,
    outputSchema: ValidateStudentDataOutputSchema,
  },
  async input => {
    const {output} = await validateStudentDataPrompt(input);
    return output!;
  }
);
