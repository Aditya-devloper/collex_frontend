"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil } from "lucide-react";
import { getAgentById } from "@/services/services";
import Loading from "@/components/shared/loading";
import {
  PermissionMatrix,
  DEFAULT_PERMISSIONS,
  type AgentPermissions,
} from "../_components/PermissionMatrix";
import moment from "moment";

type Agent = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  status: "active" | "invited" | "disabled";
  last_login?: string;
  createdAt?: string;
  permissions?: Partial<AgentPermissions>;
};

const STATUS_STYLES: Record<Agent["status"], string> = {
  active: "bg-green-100 text-green-700 hover:bg-green-100",
  invited: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  disabled: "bg-gray-100 text-gray-500 hover:bg-gray-100",
};

export default function AgentDetails() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgent = async () => {
    setLoading(true);
    try {
      const res = await getAgentById(id, {});
      if (res.data?.status) {
        setAgent(res.data?.response);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Couldn't load agent",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAgent();
  }, [id]);

  if (loading) return <Loading />;
  if (!agent) return null;

  const permissions: AgentPermissions = {
    leads: { ...DEFAULT_PERMISSIONS.leads, ...agent.permissions?.leads },
    calls: { ...DEFAULT_PERMISSIONS.calls, ...agent.permissions?.calls },
    chat: { ...DEFAULT_PERMISSIONS.chat, ...agent.permissions?.chat },
    // billing: { ...DEFAULT_PERMISSIONS.billing, ...agent.permissions?.billing },
  };

  const initials = agent.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          size="sm"
          onClick={() => router.push(`/agents/edit/${agent._id}`)}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border bg-muted text-lg font-medium text-muted-foreground">
              {agent.image ? (
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{agent.name}</h1>
              <Badge className={STATUS_STYLES[agent.status]}>
                {agent.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{agent.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{agent.phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last login</p>
              <p className="font-medium">
                {agent.last_login
                  ? new Date(agent.last_login).toLocaleString()
                  : "Not logged in yet"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Added on</p>
              <p className="font-medium">
                {agent.createdAt
                  ? moment(agent.createdAt).format("DD MMM, YYYY")
                  : "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Permissions</p>
            <PermissionMatrix value={permissions} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
