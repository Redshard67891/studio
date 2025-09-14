"use client";

import { useState, useTransition } from "react";
import type { Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveAttendanceAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

type AttendanceStatus = "present" | "absent";

export function AttendanceSheet({
  courseId,
  students,
}: {
  courseId: string;
  students: Student[];
}) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    () =>
      students.reduce(
        (acc, student) => ({ ...acc, [student.id]: "present" }),
        {}
      )
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };
  
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
      </CardHeader>
      <CardContent className="space-y-4">
        {students.map((student, index) => (
          <div key={student.id}>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
              <div className="font-medium">{student.name} <span className="text-sm text-muted-foreground">({student.studentId})</span></div>
              <RadioGroup
                defaultValue="present"
                onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="present" id={`present-${student.id}`} />
                  <Label htmlFor={`present-${student.id}`} className="text-green-600">Present</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                  <Label htmlFor={`absent-${student.id}`} className="text-red-600">Absent</Label>
                </div>
              </RadioGroup>
            </div>
            {index < students.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isPending} className="ml-auto">
            {isPending ? "Saving..." : "Save Attendance"}
        </Button>
      </CardFooter>
    </Card>
  );
}
