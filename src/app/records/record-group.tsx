
"use client";

import { useMemo } from "react";
import type { RichAttendanceRecord } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RecordsTable } from "./records-table";
import { Badge } from "@/components/ui/badge";

interface RecordGroupProps {
  records: RichAttendanceRecord[];
}

type GroupedByDate = {
  [date: string]: RichAttendanceRecord[];
};

export function RecordGroup({ records }: RecordGroupProps) {
  const groupedByDate = useMemo(() => {
    return records.reduce((acc, record) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as GroupedByDate);
  }, [records]);

  const dates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {dates.map((date) => {
        const sessionRecords = groupedByDate[date];
        const presentCount = sessionRecords.filter(r => r.status === 'present').length;
        const absentCount = sessionRecords.length - presentCount;

        return (
          <AccordionItem value={date} key={date} className="border rounded-md px-3 bg-muted/50">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex justify-between items-center w-full">
                <span className="font-medium">
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <div className="flex gap-2 pr-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">Present: {presentCount}</Badge>
                    <Badge variant="destructive">Absent: {absentCount}</Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <RecordsTable data={sessionRecords} />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
