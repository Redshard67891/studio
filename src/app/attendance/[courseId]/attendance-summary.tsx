import type { Student, AttendanceRecord } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Summary = {
  present: number;
  absent: number;
};

export function AttendanceSummary({
  students,
  records,
}: {
  students: Student[];
  records: AttendanceRecord[];
}) {
  const summaryData = students.map((student) => {
    const studentRecords = records.filter((r) => r.studentId === student.id);
    const summary: Summary = studentRecords.reduce(
      (acc, record) => {
        if (record.status === "present") acc.present++;
        if (record.status === "absent") acc.absent++;
        return acc;
      },
      { present: 0, absent: 0 }
    );
    return {
      ...student,
      summary,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead className="text-center">Present</TableHead>
                <TableHead className="text-center">Absent</TableHead>
                <TableHead className="text-right">Attendance Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.map((data) => {
                const total = data.summary.present + data.summary.absent;
                const rate = total > 0 ? (data.summary.present / total) * 100 : 0;
                return (
                  <TableRow key={data.id}>
                    <TableCell className="font-medium">{data.name}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/75">{data.summary.present}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge variant="destructive">{data.summary.absent}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{rate.toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
