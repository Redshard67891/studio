
"use server";
import { revalidatePath } from "next/cache";
import { saveAttendance } from "@/lib/data";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/types";

export async function saveAttendanceAction(
  courseId: string,
  attendanceData: Record<string, AttendanceStatus>
) {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const recordsToSave: Omit<AttendanceRecord, "id">[] = Object.entries(
    attendanceData
  ).map(([studentId, status]) => ({
    courseId,
    studentId,
    date,
    status,
  }));

  try {
    await saveAttendance(recordsToSave);
    // Revalidating the summary page is important
    revalidatePath(`/attendance/${courseId}`);
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
