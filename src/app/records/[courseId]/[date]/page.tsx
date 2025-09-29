
import { PageHeader } from "@/components/page-header";
import { getCourseById, getRecordsForSession } from "@/lib/data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SessionDetailsClient } from "./session-details-client";

export const dynamic = 'force-dynamic';

// The param is now a full ISO timestamp, but we'll keep the name `date` for simplicity
export default async function SessionDetailsPage({
  params,
}: {
  params: { courseId: string; date: string };
}) {
  const course = await getCourseById(params.courseId);
  if (!course) {
    notFound();
  }
  
  // The 'date' param is now the URL-decoded timestamp
  const timestamp = decodeURIComponent(params.date);
  
  try {
    // Validate if the timestamp is a valid date
    if (isNaN(new Date(timestamp).getTime())) {
      notFound();
    }
  } catch (e) {
    notFound();
  }

  const records = await getRecordsForSession(params.courseId, timestamp);

  const formattedDate = new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={`${course.title}`}
        description={`Attendance for ${formattedDate}`}
        actions={
          <div className="flex items-center gap-2">
             <Button asChild variant="outline">
                <Link href={`/records/${course.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sessions
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
