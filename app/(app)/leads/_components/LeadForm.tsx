"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DatePicker } from "@/app/(shared)/components/DatePicker";
import { toast } from "sonner";
import { createLead, getLeadById, updateLead } from "@/services/services";
import Loading from "@/components/shared/loading";
import PhoneInput from "react-phone-input-2";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "proposal-sent", label: "Proposal Sent" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const sourceOptions = [
  { value: "call", label: "Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "referral", label: "Referral" },
  { value: "others", label: "Others" },
];

type IForm = {
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  follow_up_date: Date | null;
  notes: string;
};

export default function LeadForm() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [save, setSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<IForm>({
    name: "",
    email: "",
    phone: "",
    status: "new",
    source: "",
    follow_up_date: null,
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const fetchLeadById = async () => {
    setLoading(true);
    if (!id) return;
    try {
      const res = await getLeadById(id, {});
      if (res.data?.status) {
        const lead = res.data?.response;
        setForm({
          name: lead.name || "",
          email: lead.email || "",
          phone: lead.phone || "",
          status: lead.status || "new",
          source: lead.source || "",
          follow_up_date: lead.follow_up_date
            ? new Date(lead.follow_up_date)
            : null,
          notes: lead.notes || "",
        });
      }
    } catch (error: any) {
      console.log("fetchLeadById error", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSave(true);
    if (!form.follow_up_date) {
      toast.error("Follow up date is required");
      setSave(false);
      return;
    }
    try {
      let res;
      const payload = {
        ...form,
        phone: form.phone ? `+${form.phone.replace(/^\+/, "")}` : "",
        follow_up_date: form.follow_up_date
          ? form.follow_up_date.toLocaleDateString("en-CA")
          : null,
      };
      if (id) {
        res = await updateLead({ ...payload, id });
      } else {
        res = await createLead(payload);
      }
      if (res.data?.status) {
        toast.success(res.data?.message);
        setForm({
          name: "",
          email: "",
          phone: "",
          status: "new",
          source: "",
          follow_up_date: null,
          notes: "",
        });
        router.back();
      }
    } catch (error: any) {
      console.log("handle submit error", error);
      toast.error(
        error?.response?.data?.response?.[0]?.msg ||
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setSave(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLeadById();
    }
  }, [id]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">
              {id ? "Edit" : "Create"} Lead
            </h1>
            {!id && (
              <Button
                size={"sm"}
                onClick={() => router.push("/leads/bulk-upload")}
              >
                Bulk Upload
              </Button>
            )}
          </div>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      autoFocus
                      required
                      onChange={handleInputChange}
                      value={form.name}
                    />
                  </div>
                  <div>
                    <Label>Follow-up Date</Label>
                    <DatePicker
                      value={form.follow_up_date}
                      onChange={(date) =>
                        setForm((prev) => ({
                          ...prev,
                          follow_up_date: date ?? null,
                        }))
                      }
                      disablePastDates={true}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <PhoneInput
                      country="in"
                      value={form.phone}
                      countryCodeEditable={false}
                      enableSearch
                      onChange={handlePhoneChange}
                      containerClass="!w-full"
                      inputClass="!w-full !h-9 !rounded-md !border !border-input !bg-white !py-1 !pr-3 !pl-[50px] !text-sm !shadow-xs"
                      buttonClass="!h-9 !rounded-l-md !border-input !bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      onChange={handleInputChange}
                      value={form.email}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          status: value,
                        }))
                      }
                      value={form.status}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Source</Label>
                    <Select
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          source: value,
                        }))
                      }
                      value={form.source}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    size={"sm"}
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size={"sm"} disabled={save}>
                    {save ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
