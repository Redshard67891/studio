
"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import type { RichAttendanceRecord, Course } from "@/lib/types";
import { RecordsTable } from "./records-table";
import { RecordsFilters, type FilterState } from "./records-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { filterRecordsAction } from "./actions";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 10;

export function RecordsClientPage({
  initialRecords,
  courses,
}: {
  initialRecords: RichAttendanceRecord[];
  courses: Course[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState<RichAttendanceRecord[]>(initialRecords);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterState>({
    studentQuery: "",
    courseId: "all",
    status: "all",
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date(),
    },
  });

  // Effect to re-fetch data when filters change
  useEffect(() => {
    startTransition(async () => {
      const result = await filterRecordsAction(filters);
      if (result.success && result.records) {
        setRecords(result.records);
        setCurrentPage(1); // Reset to first page on new filter
      } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Could not fetch records."
        })
      }
    });
  }, [filters, toast]);


  const totalPages = Math.ceil(records.length / PAGE_SIZE);
  const paginatedRecords = records.slice(
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
            isFiltering={isPending}
        />
        <div className="border-t">
          <RecordsTable data={paginatedRecords} isLoading={isPending} />
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
