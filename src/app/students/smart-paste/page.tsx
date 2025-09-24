import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SmartPasteForm } from "./smart-paste-form";

export default function SmartPastePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Smart Paste Students"
        description="Copy student data from a spreadsheet and paste it below. AI will do the rest."
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
        <SmartPasteForm />
      </div>
    </div>
  );
}
