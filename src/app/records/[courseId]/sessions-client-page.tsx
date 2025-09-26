
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

export function SessionsClientPage({
  courseId,
  initialSessions,
}: {
  courseId: string;
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
            <Link
              key={timestamp}
              href={`/records/${courseId}/${encodeURIComponent(timestamp)}`}
              className="block"
            >
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <CardTitle className="text-lg">
                    {new Date(timestamp).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </CardTitle>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

