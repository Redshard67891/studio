"use server";

import { z } from "zod";
import Papa from "papaparse";
import { addStudent } from "@/lib/data";
import { revalidatePath } from "next/cache";

const StudentDataSchema = z.object({
  studentId: z.string().describe("The unique identifier for the student."),
  name: z.string().describe("The full name of the student."),
  email: z.string().email().describe("The email address of the student."),
  major: z.string().describe("The major or field of study of the student."),
});

const ImportStudentsOutputSchema = z.object({
  validatedStudents: z
    .array(StudentDataSchema)
    .describe("An array of validated student data objects."),
  importSummary: z
    .string()
    .describe(
      "A summary of the import process, including the number of successful records and any errors found."
    ),
  failureReason: z
    .string()
    .optional()
    .describe("A specific reason why the CSV could not be processed at all."),
});

type ImportStudentsInput = { csvData: string };
type ImportStudentsOutput = z.infer<typeof ImportStudentsOutputSchema>;

/**
 * A traditional, high-performance function to import and validate students from a CSV string.
 */
export async function importStudentsFromCsvAction(
  input: ImportStudentsInput
): Promise<ImportStudentsOutput> {
  const { csvData } = input;
  if (!csvData || csvData.trim() === "") {
    return {
      validatedStudents: [],
      importSummary: "Import failed.",
      failureReason:
        "The provided CSV file is empty or does not contain any data.",
    };
  }

  // Step 1: Parse the CSV string
  const parseResult = Papa.parse<string[]>(csvData.trim(), {
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    return {
      validatedStudents: [],
      importSummary: "Import failed.",
      failureReason: `The CSV file is malformed and could not be parsed. Error: ${parseResult.errors[0].message}`,
    };
  }

  const rows = parseResult.data;
  if (rows.length <= 1) {
    return {
      validatedStudents: [],
      importSummary: "Import failed.",
      failureReason: "The CSV file does not contain any data rows.",
    };
  }

  // Step 2: Dynamically map columns by inspecting the first row
  const header = rows[0].map((h) => h.toLowerCase().trim());
  const nameIndex = header.findIndex((h) => h.includes("name"));
  const studentIdIndex = header.findIndex((h) => h.includes("id") || h.includes("student"));
  const emailIndex = header.findIndex((h) => h.includes("email"));
  const majorIndex = header.findIndex((h) => h.includes("major"));

  // If we can't find the essential columns, fail the import
  if (nameIndex === -1 || studentIdIndex === -1 || emailIndex === -1 || majorIndex === -1) {
    return {
      validatedStudents: [],
      importSummary: "Import failed.",
      failureReason: "CSV headers must contain 'name', 'studentId', 'email', and 'major'.",
    };
  }
  
  const dataRows = rows.slice(1);

  // Step 3 & 4: Iterate, validate, and collect results
  let successCount = 0;
  let skippedCount = 0;

  const studentsToAdd: Omit<z.infer<typeof StudentDataSchema>, "id">[] = [];

  for (const row of dataRows) {
    const name = row[nameIndex]?.trim();
    const studentId = row[studentIdIndex]?.trim();
    const email = row[emailIndex]?.trim();
    const major = row[majorIndex]?.trim();

    // Validate essential data
    if (!name || !studentId || !email || !major) {
      skippedCount++;
      continue;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        skippedCount++;
        continue;
    }

    // If all checks pass, queue the student for creation
    studentsToAdd.push({
      name,
      studentId,
      email,
      major,
    });
  }

  // Add all valid students to the database
  try {
    const addPromises = studentsToAdd.map(student => addStudent(student));
    await Promise.all(addPromises);
    successCount = studentsToAdd.length;
  } catch (error) {
    return {
      validatedStudents: [],
      importSummary: "Import failed.",
      failureReason: "An error occurred while saving students to the database.",
    };
  }
  

  // Final summary
  const importSummary = `Import complete. Successfully processed ${successCount} records. Skipped ${skippedCount} invalid records.`;

  revalidatePath("/students");

  return {
    validatedStudents: [], // Not needed on client
    importSummary,
  };
}
