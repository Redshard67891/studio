import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "bg-card border-b p-6 sm:p-8 sticky top-0 z-10",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <div>
                <h1 className="text-2xl font-bold tracking-tight font-headline">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-muted-foreground">{description}</p>
                )}
            </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
