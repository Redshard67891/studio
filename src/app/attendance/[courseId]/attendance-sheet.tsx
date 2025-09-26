
"use client";

import { useState, useTransition, useMemo, useEffect, memo, useCallback } from "react";
import type { Student, AttendanceStatus, Course } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveAttendanceAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search, Check, X, Download } from "lucide-react";
import { exportToCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
    { value: "present", label: "Present" },
    { value: "absent", label: "Absent" },
    { value: "excused", label: "Excused" },
];

type Summary = {
  present: number;
  absent: number;
  excused: number;
  unmarked: number;
};

const PAGE_SIZE = 5;

// Memoized StudentRow component
const StudentRow = memo(function StudentRow({
  student,
  status,
  onStatusChange,
}: {
  student: Student;
  status: AttendanceStatus | undefined;
  onStatusChange: (studentId: string, newStatus: AttendanceStatus) => void;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
      <div className="font-medium">{student.name} <span className="text-sm text-muted-foreground">({student.studentId})</span></div>
      <Select
        value={status || ""}
        onValueChange={(value) => onStatusChange(student.id, value as AttendanceStatus)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className={cn(
                "capitalize",
                opt.value === "present" && "text-green-600",
                opt.value === "absent" && "text-red-600",
                opt.value === "excused" && "text-blue-600",
              )}>{opt.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});


export function AttendanceSheet({
  course,
  students,
}: {
  course: Course;
  students: Student[];
}) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const initialSummary = {
    present: 0,
    absent: 0,
    excused: 0,
    unmarked: students.length,
  };
  const [summary, setSummary] = useState<Summary>(initialSummary);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
  const paginatedStudents = useMemo(() => filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  ), [filteredStudents, currentPage]);


  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };


  const handleStatusChange = useCallback((studentId: string, newStatus: AttendanceStatus) => {
    const oldStatus = attendance[studentId];

    setAttendance((prev) => ({ ...prev, [studentId]: newStatus }));
    
    setSummary(prevSummary => {
        const newSummary = { ...prevSummary };
        // If student was previously marked, decrement that status count
        if (oldStatus) {
            newSummary[oldStatus]--;
        } else {
            // If student was unmarked, decrement unmarked count
            newSummary.unmarked--;
        }
        // Increment the new status count
        newSummary[newStatus]++;
        return newSummary;
    });

  }, [attendance]);

  const markAll = (status: AttendanceStatus) => {
     const newAttendance: Record<string, AttendanceStatus> = {};
     // Only mark students in the current view if a search is active
     const studentsToMark = searchQuery ? filteredStudents : students;
     for (const student of studentsToMark) {
        newAttendance[student.id] = status;
     }
     setAttendance(prev => ({ ...prev, ...newAttendance}));

     // Recalculate summary based on all students
     const fullAttendance = { ...attendance, ...newAttendance };
     const newSummary = { present: 0, absent: 0, excused: 0, unmarked: 0 };
     for (const student of students) {
         const studentStatus = fullAttendance[student.id];
         if (studentStatus) {
             newSummary[studentStatus]++;
         } else {
             newSummary.unmarked++;
         }
     }
     setSummary(newSummary);
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveAttendanceAction(course.id, attendance);
      if (result.success) {
        toast({ title: "Success", description: result.message, className: "bg-accent text-accent-foreground" });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    });
  };

  const handleExport = () => {
    if (Object.keys(attendance).length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "Please mark attendance before exporting.",
      });
      return;
    }
    const dataToExport = students.map(student => ({
      'Student Name': student.name,
      'Registration ID': student.studentId,
      'Status': attendance[student.id] || 'unmarked'
    }));

    const now = new Date();
    const formattedDateTime = format(now, "yyyy-MM-dd_HH-mm-ss");
    const filename = `${course.title.replace(/ /g, "_")}-${formattedDateTime}.csv`;

    exportToCsv(dataToExport, filename);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance - {new Date().toLocaleDateString()}</CardTitle>
        <CardDescription>
          Total Students: {students.length} | Present: {summary.present} | Absent: {summary.absent} | Excused: {summary.excused} | Unmarked: {summary.unmarked}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => markAll('present')}><Check className="mr-2 h-4 w-4" />Mark All Visible Present</Button>
            <Button variant="outline" onClick={() => markAll('absent')}><X className="mr-2 h-4 w-4" />Mark All Visible Absent</Button>
          </div>
        </div>
        <Separator />
        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-2">
            {paginatedStudents.map((student) => (
              <StudentRow 
                key={student.id} 
                student={student} 
                status={attendance[student.id]} 
                onStatusChange={handleStatusChange}
              />
            ))}
        </div>
        {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
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
            </div>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2">
         <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Export Today's
        </Button>
        <Button onClick={handleSave} disabled={isPending || Object.keys(attendance).length < students.length} className="ml-auto">
          {isPending ? "Saving..." : "Save Attendance"}
        </Button>
      </CardFooter>
    </Card>
  );
}
