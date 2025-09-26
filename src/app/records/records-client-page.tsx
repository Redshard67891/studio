
"use client";

import { useState, useTransition, useEffect } from "react";
import type { RichAttendanceRecord, Course } from "@/lib/types";
import { RecordsFilters, type FilterState } from "./records-filters";
import { Card, CardContent } from "@/components/ui/card";
import { subDays } from "date-fns";
import { filterRecordsAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from "@/lib/csv";
import { GroupedRecordsView } from "./grouped-records-view";

export function RecordsClientPage({
  initialRecords,
  courses,
}: {
  initialRecords: RichAttendanceRecord[];
  courses: Course[];
}) {
  const [records, setRecords] = useState<RichAttendanceRecord[]>(initialRecords);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterState>({
    courseId: "all",
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date(),
    },
  });

  // Effect to re-fetch data when filters change
  useEffect(() => {
    startTransition(async () => {
      // Create a temporary filter state for the action
      const filtersForAction = {
        ...filters,
        studentQuery: "", // Not used in top-level filter anymore
        status: "all" as const, // Not used in top-level filter anymore
      };
      const result = await filterRecordsAction(filtersForAction);
      if (result.success && result.records) {
        setRecords(result.records);
      } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Could not fetch records."
        })
      }
    });
  }, [filters, toast]);


  const handleExport = () => {
    if (records.length === 0) {
        toast({
            variant: "destructive",
            title: "No Data to Export",
            description: "There is no data to export for the current filter selection.",
        });
        return;
    }
    const dataToExport = records.map(r => ({
      'Student Name': r.studentName,
      'Registration ID': r.studentRegId,
      'Course': r.courseTitle,
      'Date': new Date(r.date).toLocaleDateString(),
      'Status': r.status,
    }));
    exportToCsv(dataToExport, `attendance-records-${new Date().toISOString().split('T')[0]}.csv`);
  }

  return (
    <Card>
      <CardContent className="p-0">
        <RecordsFilters
            courses={courses}
            filters={filters}
            onFilterChange={setFilters}
            isFiltering={isPending}
        />
        <div className="border-t p-4 md:p-6">
            <GroupedRecordsView records={records} isLoading={isPending} />
        </div>
      </CardContent>
    </Card>
  );
}
