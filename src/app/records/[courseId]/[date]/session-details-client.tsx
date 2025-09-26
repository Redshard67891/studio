
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
import type { RichAttendanceRecord, AttendanceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 5;

export function SessionDetailsClient({ records }: { records: RichAttendanceRecord[] }) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<"all" | AttendanceStatus>("all");
    const [currentPage, setCurrentPage] = React.useState(1);

    const filteredData = React.useMemo(() => {
        return records.filter(record => {
            const searchMatch = record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                record.studentRegId.toLowerCase().includes(searchQuery.toLowerCase());
            const statusMatch = statusFilter === "all" || record.status === statusFilter;
            return searchMatch && statusMatch;
        });
    }, [records, searchQuery, statusFilter]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);


    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const paginatedData = filteredData.slice(
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
                    <SelectItem value="excused">Excused</SelectItem>
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
                    {paginatedData.length > 0 ? (
                        paginatedData.map((record) => (
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
                                    "text-xs capitalize",
                                    record.status === 'present' && "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200",
                                    record.status === 'absent' && "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200",
                                    record.status === 'excused' && "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200"
                                )}
                                variant={"secondary"}
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
        {totalPages > 1 && (
            <CardFooter className="flex items-center justify-end space-x-2 py-4">
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
            </CardFooter>
        )}
    </Card>
  );
}
