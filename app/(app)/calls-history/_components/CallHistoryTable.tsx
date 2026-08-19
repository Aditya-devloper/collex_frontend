"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone } from "lucide-react";
import moment from "moment";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/shared/loading";

export interface CallHistoryItem {
  _id: string;
  lead: {
    _id: string;
    name: string;
    phone: string;
  };
  call_status: "completed" | "no_answer" | "failed" | "in_progress";
  call_result?: string | null;
  call_balance: number;
  attempt_number: number;
  createdAt: string;
  was_charged: boolean;
}

interface CallHistoryTableProps {
  calls: CallHistoryItem[];
  page: number;
  limit: number;
  loading: boolean;
}

const statusStyles: Record<CallHistoryItem["call_status"], string> = {
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  no_answer: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  in_progress: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

const statusLabels: Record<CallHistoryItem["call_status"], string> = {
  completed: "Completed",
  no_answer: "No answer",
  failed: "Failed",
  in_progress: "In progress",
};

export function CallHistoryTable({
  calls,
  page,
  limit,
  loading,
}: CallHistoryTableProps) {
  if (loading) {
    return <Loading />;
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
        <Phone className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No calls made yet</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sr. No</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Calls</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Called at</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {calls.map((call, idx: number) => (
                <TableRow key={call._id}>
                  <TableCell className="font-medium">
                    {(page - 1) * limit + idx + 1}.
                  </TableCell>

                  <TableCell className="font-medium">
                    {call.lead?.name || "Unknown"}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {call.lead?.phone || "-"}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    - {call?.was_charged ? 1 : 0}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[call.call_status]}
                    >
                      {statusLabels[call.call_status]}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right text-muted-foreground">
                    {moment(call.createdAt).format("DD MMM YYYY, hh:mm A")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
