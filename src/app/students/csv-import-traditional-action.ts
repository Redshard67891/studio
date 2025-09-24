'use server';

import Papa from 'papaparse';
import type { ImportStudentsInput, Student } from '@/lib/types';
import { z } from 'zod';

const StudentDataSchema = z.object({
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


/**
 * A traditional, high-performance function to import and validate students from a CSV string.
 */
export async function importStudentsWithTraditionalAction(
  input: ImportStudentsInput
) {
  const { csvData } = input;

  if (!csvData || csvData.trim() === '') {
    throw new Error('The provided CSV file is empty.');
  }

  // 1. Parse the CSV string
  const parseResult = Papa.parse(csvData.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().trim(),
  });

  if (parseResult.errors.length > 0) {
    console.warn(
      'CSV Import Warning (Traditional Parsing Errors Detected):',
      parseResult.errors
    );
  }

  const rows = parseResult.data as Record<string, string>[];
  if (rows.length === 0) {
    return {
      validatedStudents: [],
      importSummary: 'Import complete. No data rows found in the CSV file.',
      failureReason: 'No data rows found.',
    };
  }

  const header =
    parseResult.meta.fields?.map((h) => h.toLowerCase().trim()) || [];
  const studentIdKey =
    header.find((h) => h.includes('student id') || h.includes('reg')) ||
    'studentid';
  const nameKey = header.find((h) => h.includes('name')) || 'name';

  const validatedStudents: Omit<Student, 'id'>[] = [];
  const skippedRecordsDetails: {
    row: any;
    reason: string;
    originalIndex: number;
  }[] = [];

  const seenRegNumbers = new Set<string>();

  for (const [index, row] of rows.entries()) {
    const originalIndex = index + 2; // +1 for 0-index, +1 for header

    const studentIdValue = row[studentIdKey]?.trim();
    const nameValue = row[nameKey]?.trim();

    const cleanedRow = {
      studentId: studentIdValue ? studentIdValue.replace(/\D/g, '') : '',
      name: nameValue || '',
    };

    const validationResult = StudentDataSchema.safeParse(cleanedRow);

    if (validationResult.success) {
      if (seenRegNumbers.has(validationResult.data.studentId)) {
        skippedRecordsDetails.push({
          row,
          reason: `Duplicate registration number: ${validationResult.data.studentId}.`,
          originalIndex,
        });
        continue;
      }
      validatedStudents.push(validationResult.data);
      seenRegNumbers.add(validationResult.data.studentId);
    } else {
      const errors = validationResult.error.errors
        .map((e) => {
          const path = e.path.join('.');
          const message = e.message;
          const received = (cleanedRow as any)[e.path[0]];
          return `Field '${path}': ${message} (Received: "${received}")`;
        })
        .join('; ');
      skippedRecordsDetails.push({
        row: cleanedRow,
        reason: `Validation failed - ${errors}`,
        originalIndex,
      });
    }
  }

  const validationSkippedCount = skippedRecordsDetails.length;

  const importSummary = `Processing complete. Found ${validatedStudents.length} valid records. Skipped ${validationSkippedCount} records.`;

  if (skippedRecordsDetails.length > 0) {
    console.warn(
      'CSV Import Skipped Records (Traditional):',
      skippedRecordsDetails
    );
  }

  return {
    validatedStudents,
    importSummary,
    failureReason: undefined,
    skippedRecordsDetails,
  };
}
