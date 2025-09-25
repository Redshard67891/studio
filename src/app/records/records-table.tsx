"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { RichAttendanceRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function RecordsTable({ data, isLoading }: { data: RichAttendanceRecord[], isLoading?: boolean }) {
  const renderSkeletons = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        <TableCell>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24 mt-2" />
        </TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-6 w-16 inline-block" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? renderSkeletons() : (
            data.length > 0 ? (
              data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <div>{record.studentName}</div>
                    <div className="text-xs text-muted-foreground">
                      {record.studentRegId}
                    </div>
                  </TableCell>
                  <TableCell>{record.courseTitle}</TableCell>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={cn(
                          "text-xs",
                          record.status === 'present' 
                              ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200" 
                              : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200"
                      )}
                      variant={record.status === "present" ? "secondary" : "destructive"}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No records found.
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
