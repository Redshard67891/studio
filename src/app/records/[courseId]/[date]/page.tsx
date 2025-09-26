
import { PageHeader } from "@/components/page-header";
import { getCourseById, getRecordsForSession } from "@/lib/data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SessionDetailsClient } from "./session-details-client";

export const dynamic = 'force-dynamic';

export default async function SessionDetailsPage({
  params,
}: {
  params: { courseId: string; date: string };
}) {
  const course = await getCourseById(params.courseId);
  if (!course) {
    notFound();
  }
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    notFound();
  }

  const records = await getRecordsForSession(params.courseId, params.date);

  const formattedDate = new Date(params.date).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={`${course.title} - ${formattedDate}`}
        description={`Attendance records for the session on ${formattedDate}.`}
        actions={
          <div className="flex items-center gap-2">
             <Button asChild variant="outline">
                <Link href={`/records/${course.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dates
                </Link>
            </Button>
          </div>
        }
      />
      <div className="flex-1 p-6 sm:p-8">
        <SessionDetailsClient records={records} />
      </div>
    </div>
  );
}
