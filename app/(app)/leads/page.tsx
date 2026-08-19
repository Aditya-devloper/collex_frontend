"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { deleteLead, exportLeads, getLeads } from "@/services/services";
import Loading from "@/components/shared/loading";
import moment from "moment";
import { Edit, Eye, Filter, X, Download, Trash2, Inbox } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/app/(shared)/components/DatePicker";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteConfirm } from "@/app/(shared)/components/DeleteConfirm";
import { PaginationComponent } from "@/app/(shared)/components/Pagination";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  interested: "bg-purple-100 text-purple-700",
  "proposal-sent": "bg-indigo-100 text-indigo-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedId, setDeletedId] = useState<null | string>(null);
  const [btnDisable, setBtnDisable] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    status: "",
    source: "",
    date_type: "",
    from: undefined as Date | undefined,
    to: undefined as Date | undefined,
  });

  const [filterOpen, setFilterOpen] = useState(false);

  // for filter count
  const [appliedFilters, setAppliedFilters] = useState({
    status: "",
    source: "",
    date_type: "",
    from: undefined as Date | undefined,
    to: undefined as Date | undefined,
  });

  const router = useRouter();

  const fetchLeads = async (
    customFilters = filters,
    customSearch = search,
    page = 1,
  ) => {
    setLoading(true);

    try {
      const payload: any = { page, limit: pagination.limit };
      if (customSearch) payload.search = customSearch;
      if (customFilters.status) payload.status = customFilters.status;
      if (customFilters.source) payload.source = customFilters.source;
      if (customFilters.date_type) payload.date_type = customFilters.date_type;
      if (customFilters.date_type === "custom") {
        if (customFilters.from) payload.from = customFilters.from;
        if (customFilters.to) payload.to = customFilters.to;
      }

      const res = await getLeads(payload);
      if (res.data.status) {
        setLeads(res.data.response);
        setPagination(res.data?.pagination);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || error?.message || "Network error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = search.trim();

      if (value.length >= 2) {
        fetchLeads(appliedFilters, value, 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const clearFilters = async () => {
    const resetFilters = {
      status: "",
      source: "",
      date_type: "",
      from: undefined,
      to: undefined,
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSearch("");
    setFilterOpen(false);

    await fetchLeads(resetFilters, "", 1);
  };

  const activeFiltersCount = [
    appliedFilters.status,
    appliedFilters.source,
    appliedFilters.date_type,
  ].filter(Boolean).length;

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleExportLead = async () => {
    setIsExporting(true);

    try {
      const payload: any = {};
      if (search.trim()) payload.search = search.trim();
      if (appliedFilters.status) payload.status = appliedFilters.status;
      if (appliedFilters.source) payload.source = appliedFilters.source;

      if (appliedFilters.date_type)
        payload.date_type = appliedFilters.date_type;

      if (appliedFilters.date_type === "custom") {
        if (appliedFilters.from) payload.from = appliedFilters.from;
        if (appliedFilters.to) payload.to = appliedFilters.to;
      }

      const res = await exportLeads(payload);
      console.log("exportLeads", res);

      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `leads_${moment().format("YYYYMMDD_HHmmss")}.csv`,
      );

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to export leads, Please try later",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    setBtnDisable(true);
    try {
      const res = await deleteLead({ id: deletedId });
      if (res.data.status) {
        toast.success(res.data.message);
        setIsDeleting(false);
        setDeletedId(null);
        await fetchLeads();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Can't delete lead",
      );
    } finally {
      setBtnDisable(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchLeads(appliedFilters, search, page);
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Leads</h1>
              <Link href="/leads/create" className="block sm:hidden">
                <Button size={"sm"}>Create Lead</Button>
              </Link>
            </div>
            {/* Filters */}
            <div className="flex gap-3 items-center flex-wrap sm:flex-nowrap">
              <div className="relative w-full sm:w-72">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or phone"
                  className="pr-10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      fetchLeads(filters, "");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="relative">
                    <div className="relative">
                      <Filter className="h-4 w-4" />

                      {activeFiltersCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[8px] text-white px-1">
                          {activeFiltersCount}
                        </span>
                      )}
                    </div>
                    Filters
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Status */}
                      <div>
                        <Label>Status</Label>

                        <Select
                          value={filters.status}
                          onValueChange={(value) =>
                            setFilters((prev) => ({
                              ...prev,
                              status: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="interested">
                              Interested
                            </SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Source */}
                      <div>
                        <Label>Source</Label>
                        <Select
                          value={filters.source}
                          onValueChange={(value) =>
                            setFilters((prev) => ({
                              ...prev,
                              source: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Source" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="call">Call</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date */}
                      <div>
                        <Label>Date</Label>

                        <Select
                          value={filters.date_type}
                          onValueChange={(value) =>
                            setFilters((prev) => ({
                              ...prev,
                              date_type: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Date Filter" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="last30days">
                              Last 30 Days
                            </SelectItem>
                            <SelectItem value="last60days">
                              Last 60 Days
                            </SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {filters.date_type === "custom" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>From</Label>
                          <DatePicker
                            value={filters.from}
                            onChange={(date) =>
                              setFilters((prev) => ({
                                ...prev,
                                from: date,
                                to: undefined,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <Label>To</Label>
                          <DatePicker
                            disabled={!filters.from}
                            minDate={filters.from}
                            value={filters.to}
                            onChange={(date) =>
                              setFilters((prev) => ({
                                ...prev,
                                to: date,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        size={"sm"}
                        onClick={clearFilters}
                      >
                        Clear
                      </Button>

                      <Button
                        size={"sm"}
                        onClick={() => {
                          setAppliedFilters(filters);
                          fetchLeads(filters, search, 1);
                          setFilterOpen(false);
                        }}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                type="button"
                onClick={handleExportLead}
                disabled={isExporting}
                variant={"outline"}
              >
                <Download className="h-5 w-5" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>

              <Link href="/leads/create" className="hidden sm:block">
                <Button size="sm">Create Lead</Button>
              </Link>
            </div>
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr. No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Follow Up Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {leads.length == 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-60">
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Inbox className="h-8 w-8 text-muted-foreground" />
                          </div>

                          <h3 className="text-lg font-semibold">
                            No leads available
                          </h3>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {leads.map((lead: any, idx: number) => (
                        <TableRow
                          key={lead._id}
                          onClick={() => router.push(`/leads/${lead._id}`)}
                          className="cursor-pointer hover:bg-muted"
                        >
                          <TableCell>
                            {(pagination.page - 1) * pagination.limit + idx + 1}
                            .
                          </TableCell>
                          <TableCell>{lead.name}</TableCell>

                          <TableCell>{lead.phone || "-"}</TableCell>
                          <TableCell>{lead.email || "-"}</TableCell>

                          <TableCell className="capitalize">
                            {lead.source || "-"}
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`capitalize ${statusColors[lead.status] || ""}`}
                            >
                              {lead.status}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {moment(lead.follow_up_date).format("DD MMM, YYYY")}
                          </TableCell>

                          <TableCell className="flex gap-2">
                            <Link href={`/leads/${lead._id}`}>
                              <Button
                                variant={"outline"}
                                size={"icon-xs"}
                                title="view"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                            </Link>
                            <Link
                              href={`/leads/edit/${lead._id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant={"outline"}
                                size={"icon-xs"}
                                title="edit"
                                className="hover:bg-blue-50"
                              >
                                <Edit className="h-5 w-5 text-blue-500" />
                              </Button>
                            </Link>
                            <Button
                              variant={"outline"}
                              size={"icon-xs"}
                              title="delete"
                              className="hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleting(true);
                                setDeletedId(lead._id);
                              }}
                            >
                              <Trash2 className="h-5 w-5 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <PaginationComponent
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      <DeleteConfirm
        open={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        description="Are you sure you want to delete this lead?"
        disabled={btnDisable}
      />
    </>
  );
}
