"use server";

import { getRichAttendanceRecords } from "@/lib/data";
import { DateRange } from "react-day-picker";

type FilterState = {
  studentQuery: string;
  courseId: string;
  status: "all" | "present" | "absent";
  dateRange: DateRange | undefined;
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
