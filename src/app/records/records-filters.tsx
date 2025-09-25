"use client";

import { useState } from "react";
import type { Course } from "@/lib/types";
import { Input } from "@/components/ui/input";
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
import { Calendar as CalendarIcon, Search, CircleDashed } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export type FilterState = {
  studentQuery: string;
  courseId: string;
  status: "all" | "present" | "absent";
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
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Student Search */}
      <div className="relative">
        {isFiltering ? (
          <CircleDashed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        )}
        <Input
          placeholder="Search by student name or ID..."
          className="pl-10"
          value={filters.studentQuery}
          onChange={(e) => handleFilterUpdate({ studentQuery: e.target.value })}
          disabled={isFiltering}
        />
      </div>

      {/* Course Filter */}
      <Select
        value={filters.courseId}
        onValueChange={(value) => handleFilterUpdate({ courseId: value })}
        disabled={isFiltering}
      >
        <SelectTrigger>
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
              "w-full justify-start text-left font-normal",
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

      {/* Status Filter */}
      <Select
        value={filters.status}
        disabled={isFiltering}
        onValueChange={(value) =>
          handleFilterUpdate({ status: value as FilterState["status"] })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="present">Present</SelectItem>
          <SelectItem value="absent">Absent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
