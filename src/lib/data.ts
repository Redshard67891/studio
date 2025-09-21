import clientPromise from "./mongodb";
import type { Student, Course, AttendanceRecord } from "./types";
import { ObjectId } from "mongodb";

// Helper to get the database instance
async function getDb() {
  const client = await clientPromise;
  return client.db(); // The database name is specified in the connection string
}

// Helper to convert a MongoDB document to our application types
// It converts the _id field from an ObjectId to a string.
function fromDoc<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, ...data } = doc;
  return { ...data, id: _id.toHexString() } as T;
}

// --- Student Functions ---

export const getStudents = async (): Promise<Student[]> => {
  const db = await getDb();
  const students = await db.collection("students").find({}).sort({ name: 1 }).toArray();
  return students.map(doc => fromDoc<Student>(doc));
};

export const getStudentById = async (id: string): Promise<Student | null> => {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const student = await db.collection("students").findOne({ _id: new ObjectId(id) });
  return student ? fromDoc<Student>(student) : null;
};

export const addStudent = async (student: Omit<Student, "id">): Promise<Student> => {
  const db = await getDb();
  const existingStudent = await db.collection("students").findOne({ studentId: student.studentId });
  if (existingStudent) {
    throw new Error(`A student with registration number ${student.studentId} already exists.`);
  }
  const result = await db.collection("students").insertOne(student);
  return { ...student, id: result.insertedId.toHexString() };
};

export const updateStudent = async (id: string, studentData: Partial<Omit<Student, "id">>) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid student ID format");
  const db = await getDb();
  
  // If studentId is being updated, check for duplicates on other students
  if (studentData.studentId) {
    const existingStudent = await db.collection("students").findOne({ 
      studentId: studentData.studentId,
      _id: { $ne: new ObjectId(id) } // $ne means "not equal"
    });
    if (existingStudent) {
      throw new Error(`A student with registration number ${studentData.studentId} already exists.`);
    }
  }

  const result = await db.collection("students").updateOne(
    { _id: new ObjectId(id) },
    { $set: studentData }
  );
  if (result.matchedCount === 0) {
    throw new Error("Student not found for update");
  }
  return result;
};

export const deleteStudent = async (id: string) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid student ID format");
  const db = await getDb();
  const result = await db.collection("students").deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    throw new Error("Student not found for deletion");
  }
  return result;
};


export const getStudentsByCourse = async (courseId: string): Promise<Student[]> => {
  // Assuming a direct relationship for now. In a real MongoDB schema,
  // you might have an array of student IDs in the course document or vice-versa.
  return getStudents(); 
};

// --- Course Functions ---

export const getCourses = async (): Promise<Course[]> => {
  const db = await getDb();
  const courses = await db.collection("courses").find({}).toArray();
  return courses.map(doc => fromDoc<Course>(doc));
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const course = await db.collection("courses").findOne({ _id: new ObjectId(id) });
  return course ? fromDoc<Course>(course) : null;
};

export const addCourse = async (course: Omit<Course, "id">): Promise<Course> => {
  const db = await getDb();
  const result = await db.collection("courses").insertOne(course);
  return { ...course, id: result.insertedId.toHexString() };
};

// --- Attendance Functions ---

export const getAttendanceByCourse = async (courseId: string): Promise<AttendanceRecord[]> => {
  const db = await getDb();
  const records = await db.collection("attendance").find({ courseId }).toArray();
  return records.map(doc => fromDoc<AttendanceRecord>(doc));
};

export const saveAttendance = async (records: Omit<AttendanceRecord, "id">[]): Promise<void> => {
  const db = await getDb();
  const bulkOps = records.map(record => ({
    updateOne: {
      filter: { 
        courseId: record.courseId, 
        studentId: record.studentId, 
        date: record.date 
      },
      update: { $set: { status: record.status } },
      upsert: true, // This will insert the document if it doesn't exist
    }
  }));

  if (bulkOps.length > 0) {
    await db.collection("attendance").bulkWrite(bulkOps);
  }
};
