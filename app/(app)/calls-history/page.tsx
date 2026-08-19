"use client";

import { useEffect, useState } from "react";
import { getCallHistory, getCallStats } from "@/services/services";
import { toast } from "sonner";
import {
  CallHistoryItem,
  CallHistoryTable,
} from "./_components/CallHistoryTable";
import { CallStatsCards } from "./_components/CallStatsCards";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { BuyCallsDialog } from "./_components/BuyCallsDialog";
import { PaginationComponent } from "@/app/(shared)/components/Pagination";

export default function CallsHistory() {
  const [calls, setCalls] = useState<CallHistoryItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

  const fetchCallHistory = async (page = 1) => {
    setLoading(true);
    try {
      const payload = {
        page,
        limit: pagination.limit,
      };
      const res = await getCallHistory(payload);
      if (res.data.status) {
        setCalls(res.data?.response);
        setPagination(res.data?.pagination);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to load call history",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCallStats = async () => {
    try {
      const res = await getCallStats({});
      if (res.data.status) {
        setStats(res.data.response);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to load call stats",
      );
    }
  };

  useEffect(() => {
    fetchCallHistory(1);
    fetchCallStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Call activity</h1>
        <Button
          size={"sm"}
          className="bg-gray-800 hover:bg-gray-900"
          onClick={() => setCreditsDialogOpen(true)}
        >
          <Wallet className="h-4 w-4 hidden sm:block" />
          {stats?.creditsRemaining.toFixed(2) ?? 0} Calls Available
        </Button>
      </div>

      <CallStatsCards
        totalCalls={stats?.totalCalls ?? 0}
        failedCalls={stats?.failed ?? 0}
        converted={stats?.converted ?? 0}
        creditsUsed={stats?.usedCredits ?? 0}
      />

      <CallHistoryTable
        calls={calls}
        page={pagination.page}
        limit={pagination.limit}
        loading={loading}
      />
      <PaginationComponent
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(newPage) => {
          fetchCallHistory(newPage);
        }}
      />

      <BuyCallsDialog
        open={creditsDialogOpen}
        onOpenChange={setCreditsDialogOpen}
      />
    </div>
  );
}
