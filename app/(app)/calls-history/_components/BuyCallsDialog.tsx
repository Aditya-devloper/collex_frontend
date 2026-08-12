"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";

interface BuyCallsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CALL_PRICE = 0.06;

const callPackages = [100, 500, 1000];

export function BuyCallsDialog({ open, onOpenChange }: BuyCallsDialogProps) {
  const [selectedCalls, setSelectedCalls] = useState<number | null>(100);

  const [customCalls, setCustomCalls] = useState("");

  const isCustom = selectedCalls === null;

  const finalCalls = isCustom ? Number(customCalls) : selectedCalls;

  const totalPrice = finalCalls * CALL_PRICE;

  const handleSelectPackage = (calls: number) => {
    setSelectedCalls(calls);
    setCustomCalls("");
  };

  const handleCustomSelect = () => {
    setSelectedCalls(null);
  };

  const handlePayment = () => {
    if (!finalCalls || finalCalls <= 0) {
      return;
    }

    console.log("Proceed to payment:", {
      calls: finalCalls,
      amount: totalPrice,
    });

    // TODO:
    // Call your payment API here
    //
    // createCheckoutSession({
    //   calls: finalCalls,
    //   amount: totalPrice,
    // });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[660px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Buy Calls</DialogTitle>

          <DialogDescription className="text-start">
            Purchase call credits for your AI calling campaigns.
          </DialogDescription>
        </DialogHeader>

        {/* Pricing */}
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <Phone className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-medium">Simple pricing</p>

              <p className="text-xs text-muted-foreground">
                1 call = $0.06 USD
              </p>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {callPackages.map((calls) => {
            const selected = selectedCalls === calls;
            const price = calls * CALL_PRICE;

            return (
              <button
                key={calls}
                type="button"
                onClick={() => handleSelectPackage(calls)}
                className={`relative flex h-28 flex-col items-center justify-center rounded-xl border transition-all ${
                  selected
                    ? "border-violet-500 bg-violet-500/5 ring-1 ring-violet-500"
                    : "border-border hover:border-violet-300 hover:bg-muted/30"
                }`}
              >
                {calls === 1000 && (
                  <span className="absolute -top-2 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white">
                    Most popular
                  </span>
                )}

                <span className="text-2xl font-semibold">
                  {calls.toLocaleString()}
                </span>

                <span className="text-xs text-muted-foreground">calls</span>

                <span className="mt-1 text-sm font-medium">
                  ${price.toFixed(2)}
                </span>
              </button>
            );
          })}

          {/* Custom */}
          <button
            type="button"
            onClick={handleCustomSelect}
            className={`flex h-28 flex-col items-center justify-center rounded-xl border transition-all ${
              isCustom
                ? "border-violet-500 bg-violet-500/5 ring-1 ring-violet-500"
                : "border-border hover:border-violet-300 hover:bg-muted/30"
            }`}
          >
            <span className="text-xl font-semibold">Custom</span>

            <span className="text-xs text-muted-foreground">Choose calls</span>
          </button>
        </div>

        {/* Custom calls */}
        {isCustom && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of calls</label>

            <Input
              type="number"
              min="1"
              step="1"
              placeholder="Enter number of calls"
              value={customCalls}
              onChange={(e) => setCustomCalls(e.target.value)}
            />

            {finalCalls > 0 && (
              <p className="text-sm text-muted-foreground">
                {finalCalls.toLocaleString()} calls × $0.06 ={" "}
                <span className="font-semibold text-foreground">
                  ${totalPrice.toFixed(2)}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="text-sm text-muted-foreground">
            {finalCalls > 0 && (
              <>
                <span className="font-medium text-foreground">
                  {finalCalls.toLocaleString()} calls
                </span>{" "}
                for{" "}
                <span className="font-semibold text-foreground">
                  ${totalPrice.toFixed(2)}
                </span>
              </>
            )}
          </div>

          <Button
            onClick={handlePayment}
            disabled={!finalCalls || finalCalls <= 0}
          >
            Go to Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
