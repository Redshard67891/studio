export type Student = {
  id: string;
  studentId: string;
  name: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  schedule: string;
};

export type AttendanceRecord = {
  id: string;
  courseId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: "present" | "absent";
};

// Types for CSV Import Flow
export type ImportStudentsInput = {
  csvData: string;
};

export type ImportStudentsOutput = {
  validatedStudents: Omit<Student, 'id'>[];
  importSummary: string;
  failureReason?: string;
  skippedRecordsDetails?: { row: any; reason: string; originalIndex: number }[];
};
