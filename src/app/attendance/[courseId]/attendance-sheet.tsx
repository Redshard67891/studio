"use client";

import { useState, useTransition, useMemo } from "react";
import type { Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveAttendanceAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search, Check, X, Repeat } from "lucide-react";

type AttendanceStatus = "present" | "absent";

export function AttendanceSheet({
  courseId,
  students,
}: {
  courseId: string;
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
    return {
      present: presentCount,
      absent: Object.keys(attendance).length - presentCount,
    }
  }, [attendance]);


  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
     setAttendance(students.reduce((acc, student) => ({ ...acc, [student.id]: status }), {}));
  }

  const invertAll = () => {
    const inverted = { ...attendance };
    for (const student of students) {
        if (inverted[student.id] === 'present') {
            inverted[student.id] = 'absent';
        } else if (inverted[student.id] === 'absent') {
            inverted[student.id] = 'present';
        } else {
            // If unmarked, default to present when inverting
            inverted[student.id] = 'present';
        }
    }
    setAttendance(inverted);
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveAttendanceAction(courseId, attendance);
      if (result.success) {
        toast({ title: "Success", description: result.message, className: "bg-accent text-accent-foreground" });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance - {new Date().toLocaleDateString()}</CardTitle>
        <CardDescription>
          Total Students: {students.length} | Present: {summary.present} | Absent: {summary.absent}
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
            <Button variant="outline" onClick={invertAll}><Repeat className="mr-2 h-4 w-4" />Invert</Button>
          </div>
        </div>
        <Separator />
        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-2">
            {filteredStudents.map((student, index) => (
              <div key={student.id}>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <div className="font-medium">{student.name} <span className="text-sm text-muted-foreground">({student.studentId})</span></div>
                  <RadioGroup
                    value={attendance[student.id] || ""}
                    onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="present" id={`present-${student.id}`} />
                      <Label htmlFor={`present-${student.id}`}>Present</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                      <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isPending || Object.keys(attendance).length !== students.length} className="ml-auto">
          {isPending ? "Saving..." : "Save Attendance"}
        </Button>
      </CardFooter>
    </Card>
  );
}
