'use server';

/**
 * @fileOverview Data validation flow for student records using an LLM.
 *
 * - validateStudentData - A function that validates and corrects student data entries.
 * - ValidateStudentDataInput - The input type for the validateStudentData function.
 * - ValidateStudentDataOutput - The return type for the validateStudentData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateStudentDataInputSchema = z.object({
  studentId: z.string().describe('The unique identifier for the student.'),
  name: z.string().describe('The full name of the student.'),
  email: z.string().email().describe('The email address of the student.'),
  major: z.string().describe('The major or field of study of the student.'),
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
  Student ID: {{{studentId}}}
  Name: {{{name}}}
  Email: {{{email}}}
  Major: {{{major}}}

  Determine if the data is valid and consistent. If there are errors, correct them and provide a list of validation errors. If the data is valid, indicate that the data is valid and consistent.

  Ensure that the email is a valid email address. Return corrected data with all the original fields if there are errors.
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
