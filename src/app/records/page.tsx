import { PageHeader } from "@/components/page-header";

export default async function RecordsPage() {

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Records"
        description="View and manage all records."
      />
      <div className="p-6 sm:p-8 flex-1">
        <div className="border rounded-lg bg-card text-card-foreground shadow-sm p-6">
          <p>Records page content goes here.</p>
        </div>
      </div>
    </div>
  );
}
