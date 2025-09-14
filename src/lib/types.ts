export type Student = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  major: string;
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
