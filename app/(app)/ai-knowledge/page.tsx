"use client";

import { ChatTester } from "@/components/call-agent/ChatTester";
import { DocUploadPanel } from "@/components/call-agent/DocUploadPanel";
import { getDocStatus } from "@/services/services";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function KnowledgePage() {
  const [currentDoc, setcurrentDoc] = useState<any>(null);

  const fetchDoc = async () => {
    try {
      const res = await getDocStatus({});
      if (res.data.status) {
        setcurrentDoc(res.data.response);
      }
    } catch (error) {
      toast.error("Failed to load doc");
    }
  };

  useEffect(() => {
    fetchDoc();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Agent knowledge
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <DocUploadPanel currentDoc={currentDoc} fetchDoc={fetchDoc} />
        <ChatTester />
      </div>
    </div>
  );
}
