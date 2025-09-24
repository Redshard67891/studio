
"use client";

import { useState, useMemo } from "react";
import type { RichAttendanceRecord, Course } from "@/lib/types";
import { RecordsTable } from "./records-table";
import { RecordsFilters, type FilterState } from "./records-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

const PAGE_SIZE = 10;

export function RecordsClientPage({
  initialRecords,
  courses,
}: {
  initialRecords: RichAttendanceRecord[];
  courses: Course[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
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

  // Reset to page 1 when filters change
  useState(() => {
    setCurrentPage(1);
  });

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Card>
      <CardContent className="p-0">
        <RecordsFilters
            courses={courses}
            filters={filters}
            onFilterChange={setFilters}
        />
        <div className="border-t">
          <RecordsTable data={paginatedRecords} />
        </div>
         <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
            <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
            >
                Next
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
