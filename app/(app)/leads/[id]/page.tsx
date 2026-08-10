"use client";

import Loading from "@/components/shared/loading";
import { getLeadActivity } from "@/services/services";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import moment from "moment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  RefreshCw,
  CalendarPlus,
  CalendarCheck,
  UserCheck,
  UserX,
  Edit,
  Briefcase,
  Facebook,
  Instagram,
  Globe,
  Radio,
  Share2,
  HelpCircle,
  ArrowLeft,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CallByAiDialog } from "@/components/call-agent/CallByAiDialog";
import { CallOutcomeCard } from "@/components/call-agent/CallOutcomeCard";

// Helper function to get status badge variant
const getStatusBadge = (status: string) => {
  switch (status) {
    case "new":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          New
        </Badge>
      );
    case "contacted":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          Contacted
        </Badge>
      );
    case "interested":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Interested
        </Badge>
      );
    case "proposal-sent":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-50 text-indigo-700 border-indigo-200"
        >
          Proposal Sent
        </Badge>
      );
    case "converted":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Converted
        </Badge>
      );
    case "lost":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Lost
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper function to get activity icon
const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case "lead_created":
      return <UserPlus className="h-5 w-5 text-green-500" />;
    case "status_changed":
      return <RefreshCw className="h-5 w-5 text-blue-500" />;
    case "note_added":
      return <MessageSquare className="h-5 w-5 text-yellow-500" />;
    case "followup_added":
      return <CalendarPlus className="h-5 w-5 text-purple-500" />;
    case "followup_completed":
      return <CalendarCheck className="h-5 w-5 text-indigo-500" />;
    case "assigned":
      return <UserCheck className="h-5 w-5 text-orange-500" />;
    case "updated":
      return <Edit className="h-5 w-5 text-gray-500" />;
    case "converted":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "lost":
      return <UserX className="h-5 w-5 text-red-500" />;
    case "ai_call_completed":
      return <Bot className="h-5 w-5 text-violet-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

// Helper function to format metadata for display
const formatMetadata = (metadata: any, activityType: string) => {
  if (!metadata) return null;

  if (activityType === "status_changed" && metadata.from && metadata.to) {
    return (
      <span className="text-sm text-muted-foreground">
        Changed from <span className="font-medium">{metadata.from}</span> to{" "}
        <span className="font-medium">{metadata.to}</span>
      </span>
    );
  }

  if (activityType === "followup_added" && metadata.from && metadata.to) {
    return (
      <span className="text-sm text-muted-foreground">
        Follow-up date changed from{" "}
        {moment(metadata.from).format("MMM D, YYYY")} to{" "}
        {moment(metadata.to).format("MMM D, YYYY")}
      </span>
    );
  }

  if (activityType === "assigned" && metadata.from && metadata.to) {
    return (
      <span className="text-sm text-muted-foreground">
        Assigned from <span className="font-medium">{metadata.from}</span> to{" "}
        <span className="font-medium">{metadata.to}</span>
      </span>
    );
  }

  if (activityType === "ai_call_completed") {
    return (
      <span className="text-sm text-muted-foreground">
        {metadata.interested && (
          <>
            Response:{" "}
            <span className="font-medium capitalize">
              {metadata.interested}
            </span>
          </>
        )}
        {metadata.preferredDay && (
          <>
            {" "}
            · Preferred day:{" "}
            <span className="font-medium">{metadata.preferredDay}</span>
          </>
        )}
        {metadata.attemptNumber && <> · Attempt #{metadata.attemptNumber}</>}
      </span>
    );
  }

  return null;
};

// Helper function to format date
const formatDate = (date: string) => {
  return moment(date).format("DD MMM, YYYY");
};

const formatDateTime = (date: string) => {
  return moment(date).format("DD MMM YYYY, h:mm A");
};

interface Lead {
  _id: string;
  created_by: string;
  business: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  follow_up_date: string;
  assigned_to: string;
  is_deleted: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
  call_attempts?: number;
  last_call_status?: string;
  last_call_at?: string;
  last_call_result?: {
    interested?: string;
    preferred_day?: string;
  } | null;
}

interface Activity {
  _id: string;
  lead: string;
  business: string;
  created_by: {
    _id: string;
    email: string;
    name: string;
  };
  activity_type: string;
  description: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [leadActivity, setLeadActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeadActivity = async () => {
    try {
      const res = await getLeadActivity({ lead_id: id });
      if (res.data?.status) {
        setLead(res.data?.response?.lead || null);
        setLeadActivity(res.data?.response?.activities || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadActivity();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!lead) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Lead not found</h3>
          <p className="text-muted-foreground">
            The lead you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <ArrowLeft
              className="h-5 w-5 cursor-pointer"
              onClick={() => router.back()}
            />
            Lead Details
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/leads/edit/${lead._id}`}>
            <Button variant={"outline"} size={"sm"}>
              <Edit className="h-4 w-4 mr-1" />
              Edit Lead
            </Button>
          </Link>

          <CallByAiDialog
            leadId={lead._id}
            leadName={lead.name}
            notes={lead.notes}
          />
        </div>
      </div>

      {/* Lead Information Grid */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Contact Information Card */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-lg font-semibold">
              Contact Information
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.name && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{lead.name}</span>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${lead.email}?subject=Regarding your lead&body=Hi ${lead.name},`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {lead.email}
                </a>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${lead.phone}`}
                  className="text-sm text-primary hover:underline"
                >
                  {lead.phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Details Card */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-lg font-semibold">
              Lead Details
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge(lead.status)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Source</span>
              <div className="flex items-center gap-2">
                <span className="text-sm capitalize">
                  {lead.source || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Follow-up Date
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {lead.follow_up_date
                    ? formatDate(lead.follow_up_date)
                    : "Not set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Call Outcome Card naya add kiya */}
        <CallOutcomeCard
          lastCallStatus={lead.last_call_status}
          lastCallAt={lead.last_call_at}
          callAttempts={lead.call_attempts}
          lastCallResult={lead.last_call_result}
        />
      </div>
      {/* Notes Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
          <CardTitle className="text-lg font-semibold">Notes</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap wrap-break-word">
            {lead.notes || "No notes added yet"}
          </p>
        </CardContent>
      </Card>

      {/* Activities Section */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Activities</CardTitle>
          <CardDescription>
            Track all interactions and changes related to this lead
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leadActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No activities yet</h3>
              <p className="text-muted-foreground">
                Activities will appear here when the lead is updated or
                interacted with.
              </p>
            </div>
          ) : (
            <div className="relative space-y-6">
              {/* Timeline line */}
              <div className="absolute left-4.75 top-3 h-[calc(100%-24px)] w-px bg-border md:left-5.75" />

              {leadActivity.map((activity) => (
                <div key={activity._id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border md:h-10 md:w-10">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 space-y-2 pb-4">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold capitalize">
                          {activity.activity_type.replace(/_/g, " ")}
                        </span>
                        {activity.created_by && (
                          <Badge variant="secondary" className="text-xs">
                            By{" "}
                            {activity.created_by.name ||
                              activity.created_by.email}
                          </Badge>
                        )}
                      </div>
                      <time className="text-xs text-muted-foreground">
                        {formatDateTime(activity.createdAt)}
                      </time>
                    </div>

                    <p className="text-sm text-foreground">
                      {activity?.description || "-"}
                    </p>

                    {formatMetadata(activity.metadata, activity.activity_type)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadDetail;
