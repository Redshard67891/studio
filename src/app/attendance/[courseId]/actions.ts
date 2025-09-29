
"use server";
import { revalidatePath } from "next/cache";
import { saveAttendance } from "@/lib/data";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/types";

export async function saveAttendanceAction(
  courseId: string,
  attendanceData: Record<string, AttendanceStatus>
) {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const timestamp = now.toISOString();

  const recordsToSave: Omit<AttendanceRecord, "id">[] = Object.entries(
    attendanceData
  ).map(([studentId, status]) => ({
    courseId,
    studentId,
    date,
    timestamp,
    status,
  }));

  try {
    await saveAttendance(recordsToSave);
    // Revalidating the course-specific records page is now important
    revalidatePath(`/records/${courseId}`);
    return {
      success: true,
      message: "Attendance saved successfully!",
    };
  } catch (error) {
    console.error("Error in saveAttendanceAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save attendance.",
    };
  }
}
