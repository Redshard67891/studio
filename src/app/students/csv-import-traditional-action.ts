
'use server';

import Papa from 'papaparse';
import { addStudent } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import type { ImportStudentsInput } from '@/lib/types';

/**
 * A traditional, high-performance function to import and validate students from a CSV string.
 * This is used as a fallback if the AI import fails.
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
    transformHeader: (header) => header.toLowerCase().trim().replace(/\s+/g, ''),
  });

  if (parseResult.errors.length > 0) {
    console.error("CSV Import Error (Traditional Parsing):", parseResult.errors);
    throw new Error(
      `The CSV file is malformed. Error: ${parseResult.errors[0].message}`
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

  const header = parseResult.meta.fields;
  if (!header) {
    throw new Error('Could not determine headers from CSV file.');
  }

  const nameKey = header.find(h => h.includes('name'));
  const regKey = header.find(h => h.includes('reg') || h.includes('id') || h.includes('studentid'));

  if (!nameKey || !regKey) {
      throw new Error("CSV headers must contain 'name' and 'studentId' (or 'registration number'/'reg no').");
  }


  const validatedStudents: { name: string; studentId: string; email?: string; major?: string; }[] = [];
  const skippedRecordsDetails: { row: any; reason: string; originalIndex: number }[] = [];
  
  const seenRegNumbers = new Set<string>();

  for (const [index, row] of rows.entries()) {
    const originalIndex = index + 2; // +1 for 0-index, +1 for header
    const name = row[nameKey]?.trim();
    let studentId = row[regKey]?.trim();

    const emailKey = header.find(h => h.includes('email'));
    const majorKey = header.find(h => h.includes('major'));
    const email = emailKey ? row[emailKey]?.trim() : undefined;
    const major = majorKey ? row[majorKey]?.trim() : undefined;

    if (!name || !studentId) {
      skippedRecordsDetails.push({ row, reason: 'Missing name or registration number.', originalIndex });
      continue;
    }
    
    studentId = studentId.replace(/\D/g, '');

    if (studentId.length !== 10) {
        skippedRecordsDetails.push({ row, reason: `Registration number '${row[regKey]}' is not 10 digits.`, originalIndex });
        continue;
    }

    if (seenRegNumbers.has(studentId)) {
        skippedRecordsDetails.push({ row, reason: `Duplicate registration number: ${studentId}.`, originalIndex });
        continue;
    }

    validatedStudents.push({
      name,
      studentId,
      email: email || '',
      major: major || ''
    });
    seenRegNumbers.add(studentId);
  }
  
  const validationSkippedCount = skippedRecordsDetails.length;

  const importSummary = `Processing complete. Found ${validatedStudents.length} valid records. Skipped ${validationSkippedCount} records.`;
  
  if (skippedRecordsDetails.length > 0) {
    console.warn("CSV Import Skipped Records (Traditional):", skippedRecordsDetails);
  }
  
  return {
    validatedStudents,
    importSummary,
    failureReason: undefined,
  };
}
