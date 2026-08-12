"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Phone, Clock, TrendingUp, Wallet, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: "violet" | "amber" | "emerald" | "muted" | "red";
}

const accentMap = {
  violet: "bg-violet-500/10 text-violet-500",
  amber: "bg-amber-500/10 text-amber-500",
  emerald: "bg-emerald-500/10 text-emerald-500",
  red: "bg-red-500/10 text-red-500",
  muted: "bg-muted text-muted-foreground",
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "muted",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            accentMap[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface CallStatsCardsProps {
  totalCalls: number;
  failedCalls: number;
  converted: number;
  creditsUsed: number;
}

export function CallStatsCards({
  totalCalls,
  failedCalls,
  converted,
  creditsUsed,
}: CallStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total calls made"
        value={totalCalls}
        icon={Phone}
        accent="violet"
      />

      <StatCard
        label="Converted"
        value={converted}
        icon={TrendingUp}
        accent="emerald"
      />

      <StatCard
        label="Failed"
        value={failedCalls}
        icon={CircleX}
        accent="red"
      />

      <StatCard
        label="Calls used"
        value={creditsUsed}
        icon={Wallet}
        accent="muted"
      />
    </div>
  );
}
