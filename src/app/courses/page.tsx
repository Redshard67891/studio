
import { getCourses } from "@/lib/data";
import type { Course } from "@/lib/types";
import { CoursesClientPage } from "./courses-client-page";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses: Course[] = await getCourses();

  return <CoursesClientPage initialCourses={courses} />;
}
