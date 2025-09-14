// THIS IS A MOCK DATABASE. DO NOT USE IN PRODUCTION.
// In a real application, you would use a database like Firestore or Prisma.

import type { Student, Course, AttendanceRecord } from "./types";

const db = {
  students: [
    {
      id: "1",
      studentId: "S001",
      name: "Alice Johnson",
      email: "alice@university.edu",
      major: "Computer Science",
    },
    {
      id: "2",
      studentId: "S002",
      name: "Bob Williams",
      email: "bob@university.edu",
      major: "Physics",
    },
    {
      id: "3",
      studentId: "S003",
      name: "Charlie Brown",
      email: "charlie@university.edu",
      major: "Mathematics",
    },
    {
      id: "4",
      studentId: "S004",
      name: "Diana Miller",
      email: "diana@university.edu",
      major: "Literature",
    },
    {
      id: "5",
      studentId: "S005",
      name: "Ethan Davis",
      email: "ethan@university.edu",
      major: "Computer Science",
    },
  ] as Student[],
  courses: [
    {
      id: "1",
      code: "CS101",
      title: "Introduction to Programming",
      schedule: "Mon/Wed 10:00-11:30",
    },
    {
      id: "2",
      code: "PHY201",
      title: "Classical Mechanics",
      schedule: "Tue/Thu 13:00-14:30",
    },
    {
      id: "3",
      code: "MA305",
      title: "Linear Algebra",
      schedule: "Mon/Wed 15:00-16:30",
    },
  ] as Course[],
  attendance: [
    { id: "1", courseId: "1", studentId: "1", date: "2024-05-01", status: "present" },
    { id: "2", courseId: "1", studentId: "2", date: "2024-05-01", status: "present" },
    { id: "3", courseId: "1", studentId: "3", date: "2024-05-01", status: "absent" },
    { id: "4", courseId: "1", studentId: "5", date: "2024-05-01", status: "present" },
    { id: "5", courseId: "1", studentId: "1", date: "2024-05-03", status: "present" },
    { id: "6", courseId: "1", studentId: "2", date: "2024-05-03", status: "absent" },
    { id: "7", courseId: "1", studentId: "3", date: "2024-05-03", status: "present" },
    { id: "8", courseId: "1", studentId: "5", date: "2024-05-03", status: "present" },
  ] as AttendanceRecord[],
};

// Functions to interact with the mock DB
export const getStudents = async () => db.students;
export const getStudentById = async (id: string) => db.students.find((s) => s.id === id);
export const getStudentsByCourse = async (courseId: string) => {
    // In a real app, this would be a join. Here we'll just assume all students are in all courses for simplicity of marking attendance.
    return db.students;
}
export const addStudent = async (student: Omit<Student, "id">) => {
  await new Promise(res => setTimeout(res, 500));
  const newStudent = { ...student, id: Date.now().toString() };
  db.students.unshift(newStudent);
  return newStudent;
};

export const getCourses = async () => db.courses;
export const getCourseById = async (id: string) => db.courses.find((c) => c.id === id);
export const addCourse = async (course: Omit<Course, "id">) => {
  await new Promise(res => setTimeout(res, 500));
  const newCourse = { ...course, id: Date.now().toString() };
  db.courses.unshift(newCourse);
  return newCourse;
};

export const getAttendanceByCourse = async (courseId: string) => db.attendance.filter((a) => a.courseId === courseId);
export const saveAttendance = async (records: Omit<AttendanceRecord, "id">[]) => {
  await new Promise(res => setTimeout(res, 500));
  records.forEach((record) => {
    const existingIndex = db.attendance.findIndex(
      (a) =>
        a.courseId === record.courseId &&
        a.studentId === record.studentId &&
        a.date === record.date
    );
    if (existingIndex !== -1) {
      db.attendance[existingIndex] = { ...db.attendance[existingIndex], status: record.status };
    } else {
      db.attendance.push({ ...record, id: Date.now().toString() + Math.random() });
    }
  });
};
