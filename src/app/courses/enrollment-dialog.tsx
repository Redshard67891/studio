
"use client";

import { useState, useTransition, useMemo } from "react";
import type { Course, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { enrollStudentsAction } from "./actions";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface EnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  students: Student[];
}

export function EnrollmentDialog({
  open,
  onOpenChange,
  course,
  students,
}: EnrollmentDialogProps) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
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

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    setSelectedStudentIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(studentId);
      } else {
        newSet.delete(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      const allFilteredIds = new Set(filteredStudents.map(s => s.id));
      setSelectedStudentIds(allFilteredIds);
    } else {
      setSelectedStudentIds(new Set());
    }
  };


  const handleEnroll = () => {
    startTransition(async () => {
      const result = await enrollStudentsAction({
        courseId: course.id,
        studentIds: Array.from(selectedStudentIds),
      });

      if (result.success) {
        toast({ title: "Success", description: result.message });
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    });
  };

  const numSelected = selectedStudentIds.size;
  const numFiltered = filteredStudents.length;
  const isAllSelected = numFiltered > 0 && numSelected === numFiltered;
  const isPartiallySelected = numSelected > 0 && numSelected < numFiltered;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enroll Students in {course.title}</DialogTitle>
          <DialogDescription>
            Select students to enroll in this course.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filteredStudents.length > 0 && (
          <div className="flex items-center space-x-2 border-y py-2 px-2">
            <Checkbox
              id="select-all"
              checked={isAllSelected || (isPartiallySelected ? "indeterminate" : false)}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="font-medium cursor-pointer">
              {isAllSelected ? "Deselect All" : "Select All"}
            </Label>
          </div>
        )}

        <ScrollArea className="flex-1 -mt-2">
          <div className="space-y-2 p-2">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
                >
                  <Checkbox
                    id={`student-${student.id}`}
                    onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                    checked={selectedStudentIds.has(student.id)}
                  />
                  <label
                    htmlFor={`student-${student.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.studentId}
                    </div>
                  </label>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground p-4">No students found or all students are already enrolled.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEnroll} disabled={isPending || selectedStudentIds.size === 0}>
            {isPending ? "Enrolling..." : `Enroll ${selectedStudentIds.size} Students`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
