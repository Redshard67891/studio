
"use server";

import { getRecordsForSession } from "@/lib/data";
import { z } from "zod";
import { ObjectId } from "mongodb";

const GetRecordsSchema = z.object({
  courseId: z.string(),
  timestamp: z.string(),
});

export async function getRecordsForSessionAction(
  data: z.infer<typeof GetRecordsSchema>
) {
  const validatedFields = GetRecordsSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
      records: null,
    };
  }

  const { courseId, timestamp } = validatedFields.data;

  if (!ObjectId.isValid(courseId)) {
    return { success: false, message: "Invalid Course ID.", records: null };
  }

  try {
    const records = await getRecordsForSession(courseId, timestamp);
    return {
      success: true,
      records,
    };
  } catch (error) {
    console.error("Error in getRecordsForSessionAction:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      message,
      records: null,
    };
  }
}
