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
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Loading from "@/components/shared/loading";
import moment from "moment";
import { Filter, X, Download, Inbox, RefreshCcw } from "lucide-react";
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
import {
  checkPaymentStatus,
  exportTransactions,
  getAllTransactions,
} from "@/services/services";
import { TransactionDetail } from "./Details";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    billing_cycle: "",
    date_type: "",
    from: undefined as Date | undefined,
    to: undefined as Date | undefined,
  });

  const [filterOpen, setFilterOpen] = useState(false);

  // for filter count
  const [appliedFilters, setAppliedFilters] = useState({
    status: "",
    billing_cycle: "",
    date_type: "",
    from: undefined as Date | undefined,
    to: undefined as Date | undefined,
  });

  const router = useRouter();

  const fetchtransactions = async (
    customFilters = filters,
    customSearch = search,
  ) => {
    setLoading(true);

    try {
      const payload: any = {};
      if (customSearch) payload.transaction_id = customSearch;
      if (customFilters.status) payload.status = customFilters.status;
      if (customFilters.billing_cycle)
        payload.billing_cycle = customFilters.billing_cycle;
      if (customFilters.date_type) payload.date_type = customFilters.date_type;
      if (customFilters.date_type === "custom") {
        if (customFilters.from) payload.from = customFilters.from;
        if (customFilters.to) payload.to = customFilters.to;
      }

      const res = await getAllTransactions(payload);
      if (res.data.status) {
        setTransactions(res.data.response.transactions);
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
        fetchtransactions();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const clearFilters = async () => {
    const resetFilters = {
      status: "",
      billing_cycle: "",
      date_type: "",
      from: undefined,
      to: undefined,
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSearch("");
    setFilterOpen(false);

    await fetchtransactions(resetFilters, "");
  };

  const activeFiltersCount = [
    appliedFilters.status,
    appliedFilters.billing_cycle,
    appliedFilters.date_type,
  ].filter(Boolean).length;

  useEffect(() => {
    fetchtransactions();
  }, []);

  const handleExportTxn = async () => {
    setIsExporting(true);

    try {
      const payload: any = {};
      if (search.trim()) payload.search = search.trim();
      if (appliedFilters.status) payload.status = appliedFilters.status;
      if (appliedFilters.billing_cycle)
        payload.billing_cycle = appliedFilters.billing_cycle;

      if (appliedFilters.date_type)
        payload.date_type = appliedFilters.date_type;

      if (appliedFilters.date_type === "custom") {
        if (appliedFilters.from) payload.from = appliedFilters.from;
        if (appliedFilters.to) payload.to = appliedFilters.to;
      }

      const res = await exportTransactions(payload);
      console.log("exporttransactions", res);

      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `transactions_${moment().format("YYYYMMDD_HHmmss")}.csv`,
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
          "Failed to export transactions, Please try later",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleCheckPayment = async (order_id: string) => {
    setCheckingStatus(true);
    try {
      const res = await checkPaymentStatus({ razorpay_order_id: order_id });
      if (res.data.status) {
        toast.success(res.data.message);
        if (res.data.response.status == "completed") {
          await fetchtransactions();
        }
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Can't check status",
      );
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h1 className="text-2xl font-semibold">Transactions</h1>
          {/* Filters */}
          <div className="flex gap-3 items-center flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-72">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by transaction id"
                className="pr-10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    fetchtransactions(filters, "");
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
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* billing_cycle */}
                    <div>
                      <Label>Billing Cycle</Label>
                      <Select
                        value={filters.billing_cycle}
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            billing_cycle: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Billing Cycle" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
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
                        fetchtransactions();
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
              onClick={handleExportTxn}
              disabled={isExporting}
              variant={"outline"}
            >
              <Download className="h-5 w-5" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No.</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <Loading />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {transactions.length == 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="h-60">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                              <Inbox className="h-8 w-8 text-muted-foreground" />
                            </div>

                            <h3 className="text-md font-semibold">
                              No transactions available
                            </h3>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {transactions.map((txn: any, index: number) => (
                          <TableRow key={txn?._id} className="hover:bg-muted">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell
                              className="cursor-pointer text-blue-500 underline"
                              onClick={() => {
                                setDetailOpen(true);
                                setSelectedTxn(txn);
                              }}
                            >
                              {txn?.transaction_id || "-"}
                            </TableCell>

                            <TableCell className="capitalize">
                              {txn?.plan || "-"}
                            </TableCell>
                            <TableCell>
                              {txn?.currency == "INR" ? "₹" : "$"}{" "}
                              {txn?.plan_amount || "-"}
                            </TableCell>

                            <TableCell className="capitalize">
                              {txn?.billing_cycle || "-"}
                            </TableCell>

                            <TableCell className="flex gap-3 items-center">
                              <Badge
                                className={`capitalize ${statusColors[txn?.status] || ""}`}
                              >
                                {txn?.status}{" "}
                              </Badge>
                              {txn?.status !== "completed" && (
                                <RefreshCcw
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCheckPayment(txn?.order_details?.id);
                                  }}
                                  className={`h-3 w-3 cursor-pointer ${checkingStatus ? "animate-spin" : ""}`}
                                />
                              )}
                            </TableCell>

                            <TableCell>
                              {moment(txn?.start_date).format("DD MMM, YYYY")}
                            </TableCell>

                            <TableCell>
                              {moment(txn?.end_date).format("DD MMM, YYYY")}
                            </TableCell>

                            <TableCell>
                              <Badge
                                className={`${txn?.is_active ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}
                              >
                                {txn?.is_active ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <TransactionDetail
        detailOpen={detailOpen}
        selectedTxn={selectedTxn}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
