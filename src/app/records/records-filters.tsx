
"use client";

import type { Course } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export type FilterState = {
  courseId: string;
  dateRange: DateRange | undefined;
};

type RecordsFiltersProps = {
  courses: Course[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isFiltering: boolean;
};

export function RecordsFilters({
  courses,
  filters,
  onFilterChange,
  isFiltering,
}: RecordsFiltersProps) {
  const handleFilterUpdate = (change: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...change });
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      {/* Course Filter */}
      <Select
        value={filters.courseId}
        onValueChange={(value) => handleFilterUpdate({ courseId: value })}
        disabled={isFiltering}
      >
        <SelectTrigger className="lg:col-span-1">
          <SelectValue placeholder="Filter by Course" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Courses</SelectItem>
          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            disabled={isFiltering}
            className={cn(
              "w-full justify-start text-left font-normal lg:col-span-2",
              !filters.dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange?.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                  {format(filters.dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(filters.dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={filters.dateRange?.from}
            selected={filters.dateRange}
            onSelect={(range) => handleFilterUpdate({ dateRange: range })}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
