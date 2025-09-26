
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SessionDetailsClient({ records }: { records: RichAttendanceRecord[] }) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<"all" | "present" | "absent">("all");

    const filteredData = React.useMemo(() => {
        return records.filter(record => {
            const searchMatch = record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                record.studentRegId.toLowerCase().includes(searchQuery.toLowerCase());
            const statusMatch = statusFilter === "all" || record.status === statusFilter;
            return searchMatch && statusMatch;
        });
    }, [records, searchQuery, statusFilter]);

  return (
    <Card>
        <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search students..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="sm:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
                </Select>
            </div>

            <div className="border rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length > 0 ? (
                        filteredData.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell className="font-medium">
                            <div>{record.studentName}</div>
                            <div className="text-xs text-muted-foreground">
                                {record.studentRegId}
                            </div>
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
                        <TableCell colSpan={2} className="h-24 text-center">
                            No students found for this filter.
                        </TableCell>
                        </TableRow>
                    )
                    }
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

