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
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAgent, updateAgent, getAgentById } from "@/services/services";
import Loading from "@/components/shared/loading";
import PhoneInput from "react-phone-input-2";
import { Camera, Loader2 } from "lucide-react";
import {
  PermissionMatrix,
  DEFAULT_PERMISSIONS,
  type AgentPermissions,
} from "./PermissionMatrix";

type IForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  status: string;
};

export default function AgentForm() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [save, setSave] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<IForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
  });
  const [permissions, setPermissions] =
    useState<AgentPermissions>(DEFAULT_PERMISSIONS);

  // existing image URL (edit mode) vs a freshly picked file (either mode) —
  // kept separate so we only send a new "image" part when the user actually
  // changed it, and can still preview it before upload.
  const [existingImage, setExistingImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const businessId = user?.business;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, phone: value }));
  };

  const fetchAgentById = async () => {
    setLoading(true);
    if (!id) return;
    try {
      const res = await getAgentById(id, {});
      if (res.data?.status) {
        const agent = res.data?.response;
        setForm({
          name: agent.name || "",
          email: agent.email || "",
          phone: agent.phone ? agent.phone.replace(/^\+/, "") : "",
          password: "",
          status: agent.status || "active",
        });
        setExistingImage(agent.image || "");
        if (agent.permissions) {
          setPermissions({
            leads: { ...DEFAULT_PERMISSIONS.leads, ...agent.permissions.leads },
            calls: { ...DEFAULT_PERMISSIONS.calls, ...agent.permissions.calls },
            chat: { ...DEFAULT_PERMISSIONS.chat, ...agent.permissions.chat },
            // billing: {
            //   ...DEFAULT_PERMISSIONS.billing,
            //   ...agent.permissions.billing,
            // },
          });
        }
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id && !form.password) {
      toast.error("Password is required for a new agent");
      return;
    }

    setSave(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append(
        "phone",
        form.phone ? `+${form.phone.replace(/^\+/, "")}` : "",
      );
      formData.append("permissions", JSON.stringify(permissions));
      if (form.password) formData.append("password", form.password);
      if (imageFile) formData.append("image", imageFile);

      let res;
      if (id) {
        formData.append("id", id);
        formData.append("status", form.status);
        res = await updateAgent(formData);
      } else {
        formData.append("businessId", businessId);
        res = await createAgent(formData);
      }

      if (res.data?.status) {
        toast.success(res.data?.message || "Saved successfully");
        router.back();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setSave(false);
    }
  };

  useEffect(() => {
    if (id) fetchAgentById();
  }, [id]);

  // revoke the object URL when it's replaced/unmounted so it doesn't leak
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const displayImage = imagePreview || existingImage;
  const initials = form.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">
              {id ? "Edit" : "Add"} Agent
            </h1>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Avatar upload */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-muted text-lg font-medium text-muted-foreground">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt="Agent"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials || <Camera className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {displayImage ? "Change photo" : "Upload photo"}
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG or PNG, up to 5MB
                    </p>
                  </div>
                </div>

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
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      disabled={!!id}
                      onChange={handleInputChange}
                      value={form.email}
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
                    <Label htmlFor="password">
                      {id ? "New password" : "Password"}{" "}
                      {!id && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required={!id}
                      placeholder={id ? "Leave blank to keep current" : ""}
                      onChange={handleInputChange}
                      value={form.password}
                    />
                  </div>
                  {id && (
                    <div>
                      <Label>Status</Label>
                      <Select
                        onValueChange={(value) =>
                          setForm((prev) => ({ ...prev, status: value }))
                        }
                        value={form.status}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Label className="mb-2 block">Permissions</Label>
                  <PermissionMatrix
                    value={permissions}
                    onChange={setPermissions}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={save}>
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
