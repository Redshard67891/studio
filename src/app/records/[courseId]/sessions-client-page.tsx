
"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { getRecordsForSessionAction } from "./actions";
import { exportToCsv } from "@/lib/csv";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/lib/types";

function SessionCard({ course, timestamp }: { course: Course; timestamp: string }) {
  const [formattedDate, setFormattedDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    // This code runs only on the client, after hydration
    setFormattedDate(
      new Date(timestamp).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    );
  }, [timestamp]);

  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the details page
    e.stopPropagation(); // Stop event bubbling

    startTransition(async () => {
      const result = await getRecordsForSessionAction({ courseId: course.id, timestamp });
      if (result.success && result.records) {
        if (result.records.length === 0) {
            toast({ variant: "destructive", title: "No records found", description: "There is no attendance data to export for this session."});
            return;
        }

        const dataToExport = result.records.map(record => ({
          'Student Name': record.studentName,
          'Registration ID': record.studentRegId,
          'Status': record.status,
        }));
        
        const formattedDateTime = format(new Date(timestamp), "yyyy-MM-dd_HH-mm-ss");
        const filename = `${course.title.replace(/ /g, "_")}-session-${formattedDateTime}.csv`;

        exportToCsv(dataToExport, filename);
        toast({ title: "Export Started", description: "Your CSV file is being downloaded."});

      } else {
        toast({ variant: "destructive", title: "Export Failed", description: result.message || "Could not fetch session data." });
      }
    });
  };

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <Link
        href={`/records/${course.id}/${encodeURIComponent(timestamp)}`}
        className="block"
      >
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
             <CardTitle className="text-lg">
                {formattedDate || <span className="text-muted-foreground">Loading date...</span>}
            </CardTitle>
            <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isPending}
                className="mt-2 sm:mt-0 max-w-fit"
            >
                <Download className="mr-2 h-4 w-4" />
                {isPending ? "Exporting..." : "Export"}
            </Button>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
      </Link>
    </Card>
  );
}


export function SessionsClientPage({
  course,
  initialSessions,
}: {
  course: Course;
  initialSessions: string[];
}) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filteredSessions = useMemo(() => {
    if (!dateRange?.from) {
      return initialSessions;
    }
    const fromDate = startOfDay(dateRange.from);
    // If only `from` is selected, `to` will be the same day.
    const toDate = dateRange.to ? startOfDay(dateRange.to) : fromDate;

    return initialSessions.filter((sessionTimestamp) => {
      const sessionDate = startOfDay(new Date(sessionTimestamp));
      return sessionDate >= fromDate && sessionDate <= toDate;
    });
  }, [initialSessions, dateRange]);
  

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
         {dateRange && (
          <Button variant="ghost" onClick={() => setDateRange(undefined)}>
            Clear
          </Button>
        )}
      </div>

      {filteredSessions.length === 0 ? (
        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/50">
          <p className="text-muted-foreground">
            No attendance records found for the selected date range.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((timestamp) => (
             <SessionCard key={timestamp} course={course} timestamp={timestamp} />
          ))}
        </div>
      )}
    </div>
  );
}
