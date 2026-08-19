"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, UserRound, Eye, Edit, Ban } from "lucide-react";
import { getAgents, deleteAgent } from "@/services/services";
import Loading from "@/components/shared/loading";
import { Card, CardContent } from "@/components/ui/card";

type Agent = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  status: "active" | "invited" | "disabled";
  last_login?: string;
};

const STATUS_STYLES: Record<Agent["status"], string> = {
  active: "bg-green-100 text-green-700 hover:bg-green-100",
  invited: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  disabled: "bg-gray-100 text-gray-500 hover:bg-gray-100",
};

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const businessId = user?.business;

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await getAgents({ businessId });
      if (res.data?.status) {
        setAgents(res.data.response || []);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Couldn't load agents",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (agent: Agent) => {
    try {
      const res = await deleteAgent(agent._id, {});
      if (res.data?.status) {
        toast.success("Agent disabled");
        setAgents((prev) =>
          prev.map((a) =>
            a._id === agent._id ? { ...a, status: "disabled" } : a,
          ),
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Couldn't disable agent",
      );
    }
  };

  useEffect(() => {
    if (businessId) fetchAgents();
  }, [businessId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Agents</h1>
        <Button size="sm" onClick={() => router.push("/agents/create")}>
          <Plus className="h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center bg-white">
          <UserRound className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No agents yet. Add your first team member to get started.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow
                    key={agent._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/agents/${agent._id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {agent.image ? (
                            <img
                              src={agent.image}
                              alt={agent.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            agent.name
                              ?.split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          )}
                        </div>
                        <span className="font-medium">{agent.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agent.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agent.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize ${STATUS_STYLES[agent.status]}`}
                      >
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => router.push(`/agents/${agent._id}`)}
                          size={"icon-sm"}
                          variant={"secondary"}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() =>
                            router.push(`/agents/edit/${agent._id}`)
                          }
                          size={"icon-sm"}
                          variant={"secondary"}
                          title="Edit"
                          className="hover:bg-blue-50"
                        >
                          <Edit className="h-5 w-5 text-blue-500" />
                        </Button>
                        {agent.status !== "disabled" && (
                          <Button
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDisable(agent)}
                            size={"icon-sm"}
                            variant={"secondary"}
                            title="Disable"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
