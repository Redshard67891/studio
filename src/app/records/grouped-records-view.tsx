
"use client";

import { useMemo } from "react";
import type { RichAttendanceRecord } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { RecordGroup } from "./record-group";

interface GroupedRecordsViewProps {
  records: RichAttendanceRecord[];
  isLoading: boolean;
}

type GroupedData = {
  [courseId: string]: {
    courseTitle: string;
    records: RichAttendanceRecord[];
  };
};

export function GroupedRecordsView({ records, isLoading }: GroupedRecordsViewProps) {
  const groupedByCourse = useMemo(() => {
    return records.reduce((acc, record) => {
      if (!acc[record.courseId]) {
        acc[record.courseId] = {
          courseTitle: record.courseTitle,
          records: [],
        };
      }
      acc[record.courseId].records.push(record);
      return acc;
    }, {} as GroupedData);
  }, [records]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  
  const courseIds = Object.keys(groupedByCourse);

  if (courseIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/50">
        <p className="text-muted-foreground">No records found for the selected filters.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {courseIds.map((courseId) => {
        const group = groupedByCourse[courseId];
        return (
          <AccordionItem value={courseId} key={courseId} className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between items-center w-full">
                <span className="font-semibold text-lg">{group.courseTitle}</span>
                <span className="text-sm text-muted-foreground pr-4">{group.records.length} total records</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <RecordGroup records={group.records} />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
