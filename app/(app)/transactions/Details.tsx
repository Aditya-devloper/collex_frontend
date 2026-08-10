import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import moment from "moment";

interface TransactionDetailProps {
  detailOpen: boolean;
  selectedTxn: any;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="max-w-[65%] break-all text-right font-medium">
      {value ?? "-"}
    </span>
  </div>
);

export function TransactionDetail({
  detailOpen,
  selectedTxn,
  onClose,
}: TransactionDetailProps) {
  if (!selectedTxn) return null;

  return (
    <Sheet open={detailOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-0">
          <SheetTitle>{selectedTxn.transaction_id}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4 py-4">
          {/* Transaction */}
          <section className="capitalize">
            <h3 className="mb-2 font-semibold">Transaction</h3>

            <Row label="Transaction ID" value={selectedTxn.transaction_id} />
            <Row
              label="Status"
              value={
                <Badge
                  variant="outline"
                  className={`capitalize ${
                    statusColors[selectedTxn.status] ??
                    "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {selectedTxn.status}
                </Badge>
              }
            />
            <Row label="Plan" value={selectedTxn.plan} />
            <Row label="Billing" value={selectedTxn.billing_cycle} />
            <Row label="Amount" value={`${selectedTxn.total_amount}`} />
            <Row label="Currency" value={selectedTxn.currency} />
          </section>

          {/* User */}
          <section>
            <h3 className="mb-2 font-semibold">User</h3>

            <Row label="Name" value={selectedTxn.user?.name || "-"} />
            <Row label="Email" value={selectedTxn.user?.email || "-"} />
          </section>

          {/* Order */}
          <section>
            <h3 className="mb-2 font-semibold">Order</h3>
            <Row label="Order ID" value={selectedTxn.order_details?.id} />
          </section>

          {/* Payment */}
          {selectedTxn.payment_details && (
            <section>
              <h3 className="mb-2 font-semibold">Payment</h3>

              <Row label="Payment ID" value={selectedTxn.payment_details?.id} />
              <Row
                label="Payment Status"
                value={selectedTxn.payment_details?.status}
              />
              <Row label="Method" value={selectedTxn.payment_details?.method} />
              <Row label="Bank" value={selectedTxn.payment_details?.bank} />
              <Row
                label="Bank Txn ID"
                value={
                  selectedTxn.payment_details?.acquirer_data
                    ?.bank_transaction_id
                }
              />
              <Row label="Email" value={selectedTxn.payment_details?.email} />
              <Row
                label="Contact"
                value={selectedTxn.payment_details?.contact}
              />
            </section>
          )}

          {/* Subscription */}
          <section>
            <h3 className="mb-2 font-semibold">Subscription</h3>

            <Row
              label="Start Date"
              value={
                selectedTxn.start_date
                  ? moment(selectedTxn.start_date).format("DD MMM YYYY")
                  : "-"
              }
            />
            <Row
              label="End Date"
              value={
                selectedTxn.end_date
                  ? moment(selectedTxn.end_date).format("DD MMM YYYY")
                  : "-"
              }
            />
            <Row
              label="Active"
              value={
                <Badge
                  className={`${
                    selectedTxn.is_active
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                  variant="outline"
                >
                  {selectedTxn.is_active ? "Yes" : "No"}
                </Badge>
              }
            />
          </section>

          {/* Timestamps */}
          <section>
            <h3 className="mb-2 font-semibold">Date</h3>

            <Row
              label="Subscribed Date"
              value={moment(selectedTxn.createdAt).format("DD MMM YYYY")}
            />
          </section>
        </div>

        <SheetFooter className="flex justify-end items-end">
          <SheetClose asChild>
            <Button variant={"destructive"} size={"sm"}>
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
