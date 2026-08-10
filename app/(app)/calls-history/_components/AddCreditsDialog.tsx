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
import { Wallet } from "lucide-react";

interface AddCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCredits: number;
}

const creditPackages = [10, 50, 100];

export function AddCreditsDialog({
  open,
  onOpenChange,
  currentCredits,
}: AddCreditsDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);

  const [customAmount, setCustomAmount] = useState("");

  const isCustom = selectedAmount === null;

  const finalAmount = isCustom ? Number(customAmount) : selectedAmount;

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomSelect = () => {
    setSelectedAmount(null);
  };

  const handlePayment = () => {
    if (!finalAmount || finalAmount <= 0) {
      return;
    }

    console.log("Proceed to payment:", finalAmount);

    // TODO:
    // Call your payment API here
    // createCheckoutSession(finalAmount)

    // Example:
    // router.push(`/billing/checkout?amount=${finalAmount}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[660px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-start">Add Credits</DialogTitle>

          <DialogDescription className="text-start">
            Credits are universal and valid for all destinations.
          </DialogDescription>
        </DialogHeader>

        {/* Current Credits */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <Wallet className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-medium">Current credits</p>
              <p className="text-xs text-muted-foreground">Available balance</p>
            </div>
          </div>

          <p className="text-lg font-semibold">$ {currentCredits.toFixed(2)}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <b>Pricing update:</b> Currently $0.06 USD per call. Soon, requests
            will use credits based on complexity.
          </p>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {creditPackages.map((amount) => {
            const selected = selectedAmount === amount;

            return (
              <button
                key={amount}
                type="button"
                onClick={() => handleSelectAmount(amount)}
                className={`relative flex h-28 flex-col items-center justify-center rounded-xl border transition-all ${
                  selected
                    ? "border-violet-500 bg-violet-500/5 ring-1 ring-violet-500"
                    : "border-border hover:border-violet-300 hover:bg-muted/30"
                }`}
              >
                {amount === 100 && (
                  <span className="absolute -top-2 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white">
                    Most popular
                  </span>
                )}

                <span className="text-2xl font-semibold">{amount}</span>

                <span className="text-xs text-muted-foreground">credits</span>
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

            <span className="text-xs text-muted-foreground">Enter amount</span>
          </button>
        </div>

        {/* Custom amount */}
        {isCustom && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom credits</label>

            <Input
              type="number"
              min="1"
              placeholder="Enter credits"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="text-sm text-muted-foreground">
            {finalAmount > 0 && (
              <>
                You'll add{" "}
                <span className="font-medium text-foreground">
                  {finalAmount} credits
                </span>
              </>
            )}
          </div>

          <Button
            onClick={handlePayment}
            disabled={!finalAmount || finalAmount <= 0}
          >
            Go to Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
