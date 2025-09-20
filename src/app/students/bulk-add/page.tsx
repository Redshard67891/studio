import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BulkAddStudentsTable } from "./bulk-add-students-table";

export default function BulkAddStudentsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Add Students in Bulk"
        description="Manually enter multiple student records in the table below."
        actions={
          <Button asChild variant="outline">
            <Link href="/students">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Link>
          </Button>
        }
      />
      <div className="p-6 sm:p-8 flex-1">
        <BulkAddStudentsTable />
      </div>
    </div>
  );
}
