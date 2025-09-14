"use server";
import { revalidatePath } from "next/cache";
import { saveAttendance } from "@/lib/data";
import type { AttendanceRecord } from "@/lib/types";

export async function saveAttendanceAction(
  courseId: string,
  attendanceData: Record<string, "present" | "absent">
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
    revalidatePath(`/attendance/${courseId}`);
    return {
      success: true,
      message: "Attendance saved successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to save attendance.",
    };
  }
}
