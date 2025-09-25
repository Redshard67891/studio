import clientPromise from "./mongodb";
import type { Student, Course, AttendanceRecord, Enrollment, RichAttendanceRecord } from "./types";
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
  
  const session = (await clientPromise).startSession();
  session.startTransaction();
  try {
    const result = await db.collection("students").deleteOne({ _id: new ObjectId(id) }, { session });
    if (result.deletedCount === 0) {
      throw new Error("Student not found for deletion");
    }
    // Also remove any enrollments for this student
    await db.collection("enrollments").deleteMany({ studentId: id }, { session });
    await db.collection("attendance").deleteMany({ studentId: id }, { session });
    
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


// --- Course Functions ---

export const getCourses = async (): Promise<Course[]> => {
  const db = await getDb();
  const courses = await db.collection("courses").find({}).sort({ title: 1 }).toArray();
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
  const existingCourse = await db.collection("courses").findOne({ code: course.code });
  if (existingCourse) {
    throw new Error(`A course with the code "${course.code}" already exists.`);
  }
  const result = await db.collection("courses").insertOne(course);
  return { ...course, id: result.insertedId.toHexString() };
};

export const updateCourse = async (id: string, courseData: Partial<Omit<Course, "id">>) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid course ID format");
  const db = await getDb();
  
  if (courseData.code) {
    const existingCourse = await db.collection("courses").findOne({ 
      code: courseData.code, 
      _id: { $ne: new ObjectId(id) }
    });
    if (existingCourse) {
      throw new Error(`A course with the code "${courseData.code}" already exists.`);
    }
  }

  const result = await db.collection("courses").updateOne(
    { _id: new ObjectId(id) },
    { $set: courseData }
  );
  if (result.matchedCount === 0) {
    throw new Error("Course not found for update");
  }
  return result;
};


export const deleteCourse = async (id: string) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid course ID format");
  const db = await getDb();

  const session = (await clientPromise).startSession();
  session.startTransaction();
  try {
    const courseDeletionResult = await db.collection("courses").deleteOne({ _id: new ObjectId(id) }, { session });
    if (courseDeletionResult.deletedCount === 0) {
      throw new Error("Course not found for deletion");
    }

    await db.collection("attendance").deleteMany({ courseId: id }, { session });
    await db.collection("enrollments").deleteMany({ courseId: id }, { session });

    await session.commitTransaction();
    return courseDeletionResult;
  } catch (error) {
    await session.abortTransaction();
    throw error; 
  } finally {
    session.endSession();
  }
};

// --- Enrollment Functions ---

export const getEnrolledStudents = async (courseId: string): Promise<Student[]> => {
  const db = await getDb();
  const enrollments = await db.collection<Enrollment>("enrollments").find({ courseId }).toArray();
  const studentIds = enrollments.map(e => new ObjectId(e.studentId));
  
  const students = await db.collection<Student>("students").find({ _id: { $in: studentIds } }).sort({ name: 1 }).toArray();
  return students.map(doc => fromDoc<Student>(doc));
};

export const getStudentsNotEnrolledInCourse = async (courseId: string): Promise<Student[]> => {
  const db = await getDb();
  const enrollments = await db.collection("enrollments").find({ courseId }).toArray();
  const enrolledStudentIds = enrollments.map(e => new ObjectId(e.studentId));

  const students = await db.collection("students").find({ _id: { $nin: enrolledStudentIds } }).sort({ name: 1 }).toArray();
  return students.map(doc => fromDoc<Student>(doc));
}

export const enrollStudentsInCourse = async (courseId: string, studentIds: string[]) => {
  const db = await getDb();
  const enrollments: Omit<Enrollment, "id">[] = studentIds.map(studentId => ({
    courseId,
    studentId,
  }));

  if (enrollments.length === 0) {
    return { insertedCount: 0 };
  }

  const result = await db.collection("enrollments").insertMany(enrollments);
  return result;
}


// --- Attendance Functions ---

export const getAttendanceByCourse = async (courseId: string): Promise<AttendanceRecord[]> => {
  const db = await getDb();
  const records = await db.collection("attendance").find({ courseId }).toArray();
  return records.map(doc => fromDoc<AttendanceRecord>(doc));
};


type FilterState = {
  studentQuery?: string;
  courseId?: string;
  status?: "all" | "present" | "absent";
  dateRange?: { from?: Date; to?: Date };
};


export const getRichAttendanceRecords = async (filters: FilterState = {}): Promise<RichAttendanceRecord[]> => {
  const db = await getDb();
  const pipeline: any[] = [];

  // --- Match Stage for Filtering ---
  const matchStage: any = {};
  if (filters.courseId && filters.courseId !== "all") {
    matchStage.courseId = filters.courseId;
  }
  if (filters.status && filters.status !== "all") {
    matchStage.status = filters.status;
  }
  if (filters.dateRange?.from) {
    matchStage.date = { ...matchStage.date, $gte: filters.dateRange.from.toISOString().split('T')[0] };
  }
  if (filters.dateRange?.to) {
    // Add a day to the 'to' date to make the range inclusive
    const toDate = new Date(filters.dateRange.to);
    toDate.setDate(toDate.getDate() + 1);
    matchStage.date = { ...matchStage.date, $lt: toDate.toISOString().split('T')[0] };
  }
  
  if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
  }

  // --- Lookup and Unwind Stages ---
  pipeline.push(
    // Need to convert string IDs to ObjectIds for joining
    {
      $addFields: {
        courseObjectId: { $toObjectId: "$courseId" },
        studentObjectId: { $toObjectId: "$studentId" }
      }
    },
    // Join with courses collection
    {
      $lookup: {
        from: 'courses',
        localField: 'courseObjectId',
        foreignField: '_id',
        as: 'courseInfo'
      }
    },
    // Join with students collection
    {
      $lookup: {
        from: 'students',
        localField: 'studentObjectId',
        foreignField: '_id',
        as: 'studentInfo'
      }
    },
    // Deconstruct the arrays from the lookups
    {
      $unwind: { path: "$courseInfo", preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: "$studentInfo", preserveNullAndEmptyArrays: true }
    }
  );

  // --- Second Match Stage for Text Search on Joined Fields ---
  if (filters.studentQuery) {
    const query = filters.studentQuery.toLowerCase();
    pipeline.push({
      $match: {
        $or: [
          { "studentInfo.name": { $regex: query, $options: 'i' } },
          { "studentInfo.studentId": { $regex: query, $options: 'i' } }
        ]
      }
    });
  }

  // --- Project and Sort Stages ---
  pipeline.push(
    // Shape the final output
    {
      $project: {
        _id: 1,
        courseId: 1,
        studentId: 1,
        date: 1,
        status: 1,
        studentName: { $ifNull: [ "$studentInfo.name", "Unknown Student" ] },
        studentRegId: { $ifNull: [ "$studentInfo.studentId", "N/A" ] },
        courseTitle: { $ifNull: [ "$courseInfo.title", "Unknown Course" ] }
      }
    },
    {
      $sort: { date: -1, courseTitle: 1, studentName: 1 }
    }
  );

  const records = await db.collection('attendance').aggregate(pipeline).toArray();

  return records.map(doc => ({
    id: doc._id.toHexString(),
    courseId: doc.courseId,
    studentId: doc.studentId,
    date: doc.date,
    status: doc.status,
    studentName: doc.studentName,
    studentRegId: doc.studentRegId,
    courseTitle: doc.courseTitle
  }));
}

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
      upsert: true, // This will insert the document if it's new
    }
  }));

  if (bulkOps.length > 0) {
    await db.collection("attendance").bulkWrite(bulkOps);
  }
};
