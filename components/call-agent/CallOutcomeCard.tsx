"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  PhoneCall,
  PhoneOff,
  CalendarClock,
  RotateCcw,
} from "lucide-react";
import moment from "moment";

interface CallOutcomeCardProps {
  lastCallStatus?: string;
  lastCallAt?: string;
  callAttempts?: number;
  lastCallResult?: {
    interested?: string;
    preferred_day?: string;
  } | null;
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: PhoneCall,
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: PhoneOff,
  },
  no_answer: {
    label: "No answer",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: PhoneOff,
  },
  not_called: {
    label: "Not called yet",
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: PhoneOff,
  },
};

const interestConfig: Record<string, { label: string; className: string }> = {
  yes: {
    label: "Interested",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  no: {
    label: "Not interested",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  maybe: {
    label: "Unclear / Maybe",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export function CallOutcomeCard({
  lastCallStatus,
  lastCallAt,
  callAttempts = 0,
  lastCallResult,
}: CallOutcomeCardProps) {
  const status =
    statusConfig[lastCallStatus || "not_called"] || statusConfig.not_called;
  const StatusIcon = status.icon;
  const interest = lastCallResult?.interested
    ? interestConfig[lastCallResult.interested]
    : null;

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          AI Call Outcome
        </CardTitle>
        <Bot className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Last call status
          </span>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>

        {interest && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Lead response</span>
            <Badge variant="outline" className={interest.className}>
              {interest.label}
            </Badge>
          </div>
        )}

        {lastCallResult?.preferred_day && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Preferred day</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {lastCallResult.preferred_day}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Call attempts</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{callAttempts}</span>
          </div>
        </div>

        {lastCallAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Last attempted
            </span>
            <span className="text-sm">
              {moment(lastCallAt).format("MMM D, h:mm A")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
