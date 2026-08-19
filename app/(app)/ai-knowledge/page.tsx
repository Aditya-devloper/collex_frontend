"use client";

import { getDocStatus } from "@/services/services";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DocUploadPanel } from "./_components/DocUploadPanel";
import { ChatTester } from "./_components/ChatTester";

export default function KnowledgePage() {
  const [currentDoc, setcurrentDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDoc = async () => {
    setLoading(true);
    try {
      const res = await getDocStatus({});
      if (res.data.status) {
        setcurrentDoc(res.data.response);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load doc",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc();
  }, []);

  return (
    <div className="">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">
        Agent knowledge
      </h1>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <DocUploadPanel
          currentDoc={currentDoc}
          fetchDoc={fetchDoc}
          loading={loading}
        />
        <ChatTester />
      </div>
    </div>
  );
}
