
"use client";

import { useState, useTransition, useMemo } from "react";
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

export function AttendanceSheet({
  course,
  students,
}: {
  course: Course;
  students: Student[];
}) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);
  
  const summary = useMemo(() => {
    const presentCount = Object.values(attendance).filter(s => s === 'present').length;
    const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
    const excusedCount = Object.values(attendance).filter(s => s === 'excused').length;
    return {
      present: presentCount,
      absent: absentCount,
      excused: excusedCount,
      unmarked: students.length - Object.keys(attendance).length,
    }
  }, [attendance, students.length]);


  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
     setAttendance(students.reduce((acc, student) => ({ ...acc, [student.id]: status }), {}));
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
          Total Students: {students.length} | Present: {summary.present} | Absent: {summary.absent} | Excused: {summary.excused}
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
            <Button variant="outline" onClick={() => markAll('present')}><Check className="mr-2 h-4 w-4" />Mark All Present</Button>
            <Button variant="outline" onClick={() => markAll('absent')}><X className="mr-2 h-4 w-4" />Mark All Absent</Button>
          </div>
        </div>
        <Separator />
        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-2">
            {filteredStudents.map((student) => (
              <div key={student.id}>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <div className="font-medium">{student.name} <span className="text-sm text-muted-foreground">({student.studentId})</span></div>
                   <Select
                    value={attendance[student.id] || ""}
                    onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
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
              </div>
            ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
         <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Export Today's
        </Button>
        <Button onClick={handleSave} disabled={isPending || Object.keys(attendance).length !== students.length} className="ml-auto">
          {isPending ? "Saving..." : "Save Attendance"}
        </Button>
      </CardFooter>
    </Card>
  );
}
