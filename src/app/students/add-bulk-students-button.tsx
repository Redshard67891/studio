"use client";
import { Button } from "@/components/ui/button";
import { ListPlus } from "lucide-react";
import Link from "next/link";

export function AddBulkStudentsButton() {
    return (
        <Button asChild variant="outline">
            <Link href="/students/bulk-add">
                <ListPlus className="mr-2 h-4 w-4" />
                Add in Bulk
            </Link>
        </Button>
    )
}
