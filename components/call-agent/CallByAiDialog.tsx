"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PhoneCall, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { triggerCall } from "@/services/services";

interface CallByAiDialogProps {
  leadId: string;
  leadName: string;
  notes: string;
}

export function CallByAiDialog({
  leadId,
  leadName,
  notes,
}: CallByAiDialogProps) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    if (notes) setContext(notes);
  }, [notes]);

  const handleCall = async () => {
    setIsCalling(true);
    try {
      const res = await triggerCall({ leadId, context });
      if (res.data.status) {
        toast.success(res.data.message);
        setOpen(false);
        setContext("");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Please try again.",
      );
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2" size={"sm"}>
          <Sparkles className="h-4 w-4" />
          Call with AI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4" />
            Call {leadName}
          </DialogTitle>
          <DialogDescription className="text-start">
            Tell the agent what this call should cover. It already knows your
            uploaded business info this is just anything specific to this lead.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="call-context text-lg">
            What should the agent focus on?
          </Label>
          <Textarea
            id="call-context"
            placeholder="e.g. Follow up on the 2BHK they asked about last week, confirm if they can visit this weekend."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={4}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            // disabled={isCalling}
            size={"sm"}
          >
            Cancel
          </Button>
          <Button onClick={handleCall} disabled={isCalling} size={"sm"}>
            {isCalling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting
                call...
              </>
            ) : (
              "Start call"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
