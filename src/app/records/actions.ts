
"use server";

import { getRichAttendanceRecords } from "@/lib/data";
import { DateRange } from "react-day-picker";

type FilterState = {
  courseId: string;
  dateRange: DateRange | undefined;
  // studentQuery and status are no longer top-level filters,
  // but we keep them here to avoid breaking getRichAttendanceRecords call immediately.
  // The client will now pass empty/default values for them.
  studentQuery: string; 
  status: "all" | "present" | "absent";
};

export async function filterRecordsAction(filters: FilterState) {
    try {
        const records = await getRichAttendanceRecords(filters);
        return {
            success: true,
            records,
        }
    } catch(error) {
        console.error("Error in filterRecordsAction:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while filtering records.";
        return {
            success: false,
            message: errorMessage,
            records: [],
        }
    }
}
