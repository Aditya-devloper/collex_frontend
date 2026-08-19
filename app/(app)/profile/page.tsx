"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Edit,
  Upload,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { getUserById, updateUser } from "@/services/services";
import Loading from "@/components/shared/loading";
import { toast } from "sonner";
import PhoneInput from "react-phone-input-2";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");

  const fetchUser = async () => {
    try {
      const res = await getUserById({});
      if (res.data.status) {
        const userData = res.data.response;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });
        if (userData.image) {
          const imageUrl = userData.image;
          setExistingImage(imageUrl);
          setImagePreview(imageUrl);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Helper function to get user type badge
  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case "owner":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            Owner
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Admin
          </Badge>
        );
      case "agent":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Agent
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Blocked
      </Badge>
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, JPG, or WEBP images are allowed");
        return;
      }

      if (file.size > 500 * 1024) {
        toast.error("Image size should be less than 500KB");
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("email", formData.email);
      submitFormData.append(
        "phone",
        formData.phone ? `+${formData.phone.replace(/^\+/, "")}` : "",
      );

      if (imageFile) {
        submitFormData.append("image", imageFile);
      } else if (!imagePreview && !existingImage) {
        submitFormData.append("image", "");
      }

      const res = await updateUser(user?._id, submitFormData);
      if (res.data.status) {
        toast.success(res.data.message || "Profile updated successfully");
        await fetchUser();
        setIsEditMode(false);
        setImageFile(null);
      } else {
        toast.error(res.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    if (user?.image) {
      const imageUrl = user.image;
      setImagePreview(imageUrl);
      setExistingImage(imageUrl);
    } else {
      setImagePreview(null);
      setExistingImage("");
    }
    setImageFile(null);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get the current image source to display
  const getImageSource = () => {
    if (imagePreview) {
      return imagePreview;
    }
    if (user?.image) {
      return user.image;
    } else if (user?.profilePic) {
      return user.profilePic;
    }
    return undefined;
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          <div className="flex gap-4 items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Profile</h1>
            </div>
            {!isEditMode ? (
              <Button size="sm" onClick={() => setIsEditMode(true)}>
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Profile Image Card - Show in both modes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {isEditMode ? (
                    <Upload className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-lg sm:h-32 sm:w-32">
                      <AvatarImage
                        src={getImageSource()}
                        alt={formData.name || user?.name}
                      />
                      <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                        {getInitials(formData.name || user?.name) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {/* {isEditMode && imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-md transition-colors hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )} */}
                  </div>

                  {isEditMode && (
                    <div className="flex flex-1 flex-col gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="relative"
                      >
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleImageChange}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Image
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPEG, PNG, JPG, WEBP (max 500kb)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase text-muted-foreground">
                      Full Name
                    </Label>
                    {isEditMode ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {user?.name || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase text-muted-foreground">
                      Email Address
                    </Label>
                    {isEditMode ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{user?.email}</p>
                        {user?.is_verified && (
                          <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase text-muted-foreground">
                      Phone Number
                    </Label>
                    {isEditMode ? (
                      <PhoneInput
                        country="in"
                        value={formData.phone}
                        countryCodeEditable={false}
                        enableSearch
                        onChange={(phone) => handleChange("phone", phone)}
                        containerClass="!w-full"
                        inputClass="!w-full !h-9 !rounded-md !border !border-input !bg-white !py-1 !pr-3 !pl-[50px] !text-sm !shadow-xs"
                        buttonClass="!h-9 !rounded-l-md !border-input !bg-white"
                      />
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{user?.phone || "-"}</p>
                      </div>
                    )}
                  </div>

                  {/* Account Status & Type */}
                  {!isEditMode && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium uppercase text-muted-foreground">
                        Account Status
                      </Label>
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {getStatusBadge(user?.status)}
                        <div className="ml-auto">
                          {getUserTypeBadge(user?.user_type)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
