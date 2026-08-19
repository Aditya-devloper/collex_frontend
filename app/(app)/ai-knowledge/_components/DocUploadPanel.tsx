"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDoc, uploadDoc } from "@/services/services";
import moment from "moment";
import { DeleteConfirm } from "@/app/(shared)/components/DeleteConfirm";
import Loading from "../../../../components/shared/loading";

interface DocUploadPanelProps {
  currentDoc?: { name: string; uploadedAt: string } | null;
  fetchDoc?: () => void;
  loading: boolean;
}

export function DocUploadPanel({
  currentDoc,
  fetchDoc,
  loading,
}: DocUploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadDoc(formData);
      if (res.data.status) {
        toast.success(res.data.message);
        setFile(null);
        fetchDoc?.();
      }
    } catch (err: any) {
      toast.error("Upload failed", {
        description: err?.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteDoc({});
      if (res.data.status) {
        toast.success(res.data.message);
        fetchDoc?.();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to delete",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Business knowledge
          </CardTitle>
          <CardDescription>
            Upload one document at a time. Delete the current file before
            uploading a new one so the AI doesn&apos;t mix old and new
            information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="h-50 flex justify-center items-center w-full">
              <Loader2 className="animate-spin text-blue-700" />
            </div>
          ) : (
            <>
              {currentDoc ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {currentDoc.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded At -{" "}
                        {moment(currentDoc.uploadedAt).format("DD MMM YYYY")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(true)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  No document uploaded yet
                </div>
              )}

              {!currentDoc && (
                <div className="space-y-3">
                  <label
                    htmlFor="doc-upload"
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    {file ? file.name : "Choose a PDF, Excel, or Word file"}
                    <input
                      id="doc-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <Button
                    className="w-full"
                    disabled={!file || isUploading}
                    onClick={handleUpload}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Uploading...
                      </>
                    ) : (
                      "Upload document"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DeleteConfirm
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={handleDelete}
        title="Delete Document"
        description="Are you sure you want to delete this document? Once deleted, the AI will no longer have access to the business information contained in it."
      />
    </>
  );
}
