"use client";

import { useState, useMemo } from "react";
import type { RichAttendanceRecord, Course } from "@/lib/types";
import { RecordsTable } from "./records-table";
import { RecordsFilters, type FilterState } from "./records-filters";
import { Card, CardContent } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

export function RecordsClientPage({
  initialRecords,
  courses,
}: {
  initialRecords: RichAttendanceRecord[];
  courses: Course[];
}) {
  const [filters, setFilters] = useState<FilterState>({
    studentQuery: "",
    courseId: "all",
    status: "all",
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date(),
    },
  });

  const filteredRecords = useMemo(() => {
    let records = initialRecords;

    if (filters.courseId !== "all") {
      records = records.filter((r) => r.courseId === filters.courseId);
    }
    if (filters.status !== "all") {
      records = records.filter((r) => r.status === filters.status);
    }
    if (filters.studentQuery) {
      const query = filters.studentQuery.toLowerCase();
      records = records.filter(
        (r) =>
          r.studentName.toLowerCase().includes(query) ||
          r.studentRegId.toLowerCase().includes(query)
      );
    }
    if (filters.dateRange?.from) {
      records = records.filter(
        (r) => new Date(r.date) >= filters.dateRange!.from!
      );
    }
    if (filters.dateRange?.to) {
        // Add a day to the 'to' date to make the range inclusive
        const toDate = new Date(filters.dateRange.to);
        toDate.setDate(toDate.getDate() + 1);
        records = records.filter((r) => new Date(r.date) < toDate);
    }

    return records;
  }, [initialRecords, filters]);

  return (
    <Card>
      <CardContent className="p-0">
        <RecordsFilters
            courses={courses}
            filters={filters}
            onFilterChange={setFilters}
        />
        <div className="border-t">
          <RecordsTable data={filteredRecords} />
        </div>
      </CardContent>
    </Card>
  );
}