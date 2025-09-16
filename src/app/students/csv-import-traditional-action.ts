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
  const parseResult = Papa.parse<string[]>(csvData.trim(), {
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    throw new Error(
      `The CSV file is malformed. Error: ${parseResult.errors[0].message}`
    );
  }

  const rows = parseResult.data;
  if (rows.length === 0) {
    throw new Error('The CSV file does not contain any data rows.');
  }

  // 2. Dynamically map columns by inspecting the first row
  const header = rows[0].map((h) => h.toLowerCase().trim());
  let nameIndex = header.findIndex((h) => h.includes('name'));
  let regIndex = header.findIndex(
    (h) => h.includes('reg') || h.includes('id') || h.includes('student')
  );
  let emailIndex = header.findIndex((h) => h.includes('email'));
  let majorIndex = header.findIndex((h) => h.includes('major'));


  const hasHeader = nameIndex !== -1 && regIndex !== -1;
  const dataRows = hasHeader ? rows.slice(1) : rows;

  // If no header, assume default order
  if (!hasHeader) {
      nameIndex = 0;
      regIndex = 1;
      emailIndex = 2;
      majorIndex = 3;
  }

  // 3 & 4: Iterate, validate, and collect results
  const studentsToAdd: { name: string; studentId: string; email?: string; major?: string; }[] = [];
  let successCount = 0;
  let skippedCount = 0;

  const seenRegNumbers = new Set<string>();

  for (const row of dataRows) {
    const name = row[nameIndex]?.trim();
    let studentId = row[regIndex]?.trim();
    const email = row[emailIndex]?.trim() || undefined;
    const major = row[majorIndex]?.trim() || undefined;
    
    // Validate essential data
    if (!name) {
      skippedCount++;
      continue;
    }

    // Sanitize and validate registration number
    if (studentId) {
      studentId = studentId.replace(/\D/g, ''); // Remove all non-digits
    }

    if (studentId?.length !== 10) {
      skippedCount++;
      continue;
    }

    // Handle duplicates
    if (seenRegNumbers.has(studentId)) {
        skippedCount++;
        continue;
    }

    // If all checks pass, add the student
    studentsToAdd.push({
      name,
      studentId,
      email,
      major
    });
    seenRegNumbers.add(studentId);
    successCount++;
  }

  if (studentsToAdd.length > 0) {
      try {
        const addPromises = studentsToAdd.map(student => addStudent(student));
        await Promise.all(addPromises);
      } catch (error) {
        throw new Error("An error occurred while saving students to the database.");
      }
  }
  
  revalidatePath("/students");
  
  // Final summary
  const importSummary = `Import complete. Successfully processed ${successCount} records. Skipped ${skippedCount} invalid or duplicate records.`;

  return {
    importSummary,
  };
}
