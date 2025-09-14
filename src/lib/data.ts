import { db } from "./firebase";
import type { Student, Course, AttendanceRecord } from "./types";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

// Helper to convert a Firestore document to a specific type
function fromDoc<T>(doc: any): T {
  const data = doc.data() as T;
  return { ...data, id: doc.id };
}

// Functions to interact with Firestore
export const getStudents = async (): Promise<Student[]> => {
  const snapshot = await getDocs(collection(db, "students"));
  return snapshot.docs.map((doc) => fromDoc<Student>(doc));
};

export const getStudentById = async (id: string): Promise<Student | null> => {
  const docRef = doc(db, "students", id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? fromDoc<Student>(docSnap) : null;
};

export const getStudentsByCourse = async (courseId: string): Promise<Student[]> => {
  // In a real app, you might have a subcollection or a field to filter by.
  // For now, we'll return all students, assuming they can be enrolled in any course.
  return getStudents();
}

export const addStudent = async (student: Omit<Student, "id">): Promise<Student> => {
  const docRef = await addDoc(collection(db, "students"), student);
  return { ...student, id: docRef.id };
};

export const getCourses = async (): Promise<Course[]> => {
  const snapshot = await getDocs(collection(db, "courses"));
  return snapshot.docs.map((doc) => fromDoc<Course>(doc));
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  const docRef = doc(db, "courses", id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? fromDoc<Course>(docSnap) : null;
};

export const addCourse = async (course: Omit<Course, "id">): Promise<Course> => {
  const docRef = await addDoc(collection(db, "courses"), course);
  return { ...course, id: docRef.id };
};

export const getAttendanceByCourse = async (courseId: string): Promise<AttendanceRecord[]> => {
  const q = query(collection(db, "attendance"), where("courseId", "==", courseId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromDoc<AttendanceRecord>(doc));
};

export const saveAttendance = async (records: Omit<AttendanceRecord, "id">[]): Promise<void> => {
    const batch = writeBatch(db);

    const promises = records.map(async (record) => {
        const { courseId, studentId, date, status } = record;

        // Query for an existing record
        const q = query(collection(db, "attendance"),
            where("courseId", "==", courseId),
            where("studentId", "==", studentId),
            where("date", "==", date)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // Update existing record
            const docRef = snapshot.docs[0].ref;
            batch.update(docRef, { status });
        } else {
            // Add new record
            const docRef = doc(collection(db, "attendance"));
            batch.set(docRef, record);
        }
    });

    await Promise.all(promises);
    await batch.commit();
};
