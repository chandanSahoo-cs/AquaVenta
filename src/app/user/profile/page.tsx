"use client";

import { storage } from "@/lib/firebase";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import type React from "react";

import { getRecentSubmissions } from "@/actions/media";
import {
  deleteUserPhoto,
  getUserProfile,
  updateUserProfile,
} from "@/actions/profile";
import {
  getUserReportByVerdict,
  UserReportResponse,
} from "@/actions/user.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Camera,
  Download,
  Edit2,
  ExternalLink,
  Play,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  photo: string | null;
  isActive: boolean;
}

interface Submission {
  id: string;
  media: string;
  status: string;
  severity: number;
  submittedAt: string;
  category?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [userReport, setUserReport] = useState<UserReportResponse>({
    success: false,
    userReport: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [filteredReport, setFilteredReport] = useState([]);

  useEffect(() => {
    loadProfileData();
    loadUserReport();
  }, []);

  const loadUserReport = async () => {
    const report = await getUserReportByVerdict();
    if (!report) return;
    setUserReport(report);
  };

  useEffect(() => {
    if (!userReport) return;
    const filtered = userReport.userReport.filter(
      (ur) => ur?.validations?.[0]?.verdict === "false"
    );
    //@ts-ignore
    setFilteredReport(filtered);
  }, [userReport]);

  const loadProfileData = async () => {
    try {
      const [profileResult, submissionsResult] = await Promise.all([
        getUserProfile(),
        getRecentSubmissions(6),
      ]);

      // runtime type guard for user payload
      const isUserProfile = (v: unknown): v is UserProfile => {
        if (typeof v !== "object" || v === null) return false;
        const o = v as Record<string, unknown>;
        return (
          typeof o.id === "string" &&
          (o.name === null || typeof o.name === "string") &&
          (o.email === null || typeof o.email === "string") &&
          (o.phone === null || typeof o.phone === "string") &&
          (o.photo === null || typeof o.photo === "string")
        );
      };

      if (profileResult.success && isUserProfile(profileResult.data)) {
        setProfile(profileResult.data);
        setEditedProfile(profileResult.data);
      }

      // runtime type guard for submissions array (validate shape of each element)
      const isSubmission = (x: unknown): x is Submission => {
        if (typeof x !== "object" || x === null) return false;
        const s = x as Record<string, unknown>;
        return (
          typeof s.id === "string" &&
          typeof s.media === "string" &&
          typeof s.status === "string" &&
          typeof s.severity === "number" &&
          (typeof s.submittedAt === "string" || s.submittedAt instanceof Date)
        );
      };

      const isSubmissionArray = (v: unknown): v is Submission[] =>
        Array.isArray(v) && v.every((el) => isSubmission(el));

      if (
        submissionsResult.success &&
        isSubmissionArray(submissionsResult.data)
      ) {
        setSubmissions(submissionsResult.data);
      }
    } catch (error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      // Build payload matching server expectation: only string values (no null)
      const payload: {
        name?: string;
        email?: string;
        phone?: string;
        photo?: string;
      } = {};
      const keys = ["name", "email", "phone", "photo"] as const;

      for (const k of keys) {
        if (Object.prototype.hasOwnProperty.call(editedProfile, k)) {
          const val = editedProfile[k as keyof typeof editedProfile] as
            | string
            | null
            | undefined;
          if (val === undefined) continue; // untouched
          payload[k] = val === null ? "" : String(val); // convert null => "" to clear on server if desired
        }
      }

      const result = await updateUserProfile(profile.id, payload);
      if (result.success) {
        // apply to UI and map empty-string back to null
        const updated: UserProfile = { ...profile };
        for (const k of keys) {
          if (k in payload) {
            const v = payload[k];
            if (v === "") {
              updated[k] = null;
            } else if (typeof v === "string") {
              updated[k] = v;
            }
          }
        }
        setProfile(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setIsSaving(true);
    try {
      if (!storage) {
        throw new Error(
          "Firebase Storage not initialized on client. Ensure src/lib/firebase.ts initializes storage on window."
        );
      }

      const path = `profiles/${profile.id}-${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const downloadURL = await getDownloadURL(sRef);

      // Save URL to server (updateUserProfile now accepts photo)
      const result = await updateUserProfile(profile.id, {
        photo: downloadURL,
      });
      if (result.success) {
        setProfile({ ...profile, photo: downloadURL });
      } else {
        console.error("Failed to save photo URL to server:", result);
      }
    } catch (error) {
      console.error("Failed to upload photo:", error);
    } finally {
      setIsSaving(false);
      // clear file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok.");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank");
    }
  };
  const handleDeletePhoto = async () => {
    if (!profile) return;

    try {
      const result = await deleteUserPhoto(profile.id);
      if (result.success) {
        // store null in UI for cleared photo
        setProfile({ ...profile, photo: null });
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  // use a clean URL check like submissions page (ignore query string when checking extension)
  const isVideo = (url: string) => {
    const cleanUrl = url ? url.split("?")[0] : "";
    return cleanUrl && /\.(mp4|webm|mov|ogg|avi)$/i.test(cleanUrl);
  };

  // removed client-side thumbnail generation (use poster/fallback or stored thumbnail if available)

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Profile not found</h1>
          <p className="text-gray-600 mt-2">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          " flex justify-center items-center mx-28 p-3 rounded-2xl bg-green-300",
          filteredReport.length >= 3 && "bg-red-300"
        )}>
        <div>{filteredReport.length} reports of yours have been rejected</div>
      </div>
      <div className="max-w-screen-xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-balance">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Recent Submissions (takes 2 of 3 columns) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Submissions
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/user/submissions")}>
                  View All Submissions
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No submissions yet</p>
                  <Button
                    variant="outline"
                    className="mt-2 bg-transparent"
                    onClick={() => router.push("/user/upload")}>
                    Create First Submission
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {submissions.map((submission) => {
                    // Use the same logic as submissions page
                    const isVideoResult = isVideo(submission.media);

                    return (
                      <Dialog key={submission.id}>
                        <DialogTrigger asChild>
                          <div className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 aspect-square">
                            {isVideoResult ? (
                              <>
                                <video
                                  src={submission.media}
                                  className="w-full h-full object-cover object-center bg-black"
                                  preload="metadata"
                                  muted
                                  playsInline
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 group-hover:bg-black/40">
                                  <div className="bg-black/30 rounded-full p-3">
                                    <Play className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <img
                                src={submission.media || "/placeholder.svg"}
                                alt={submission.category || "Submission"}
                                sizes="(max-width: 768px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full"
                              />
                            )}
                            <div className="absolute top-2 left-2 flex gap-1">
                              <Badge
                                className={`${getStatusColor(
                                  submission.status
                                )} text-white text-xs`}>
                                {submission.status}
                              </Badge>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                          <DialogTitle className="sr-only">
                            Submission preview
                          </DialogTitle>
                          <div className="relative">
                            {isVideoResult ? (
                              <video
                                src={submission.media}
                                controls
                                autoPlay
                                className="w-full max-h-[70vh] object-contain"
                              />
                            ) : (
                              <img
                                src={submission.media || "/placeholder.svg"}
                                alt={submission.category || "Submission"}
                                width={1200}
                                height={800}
                                className="w-full max-h-[70vh] object-contain"
                              />
                            )}
                            <div className="p-4 border-t">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex gap-2">
                                  <Badge
                                    className={`${getStatusColor(
                                      submission.status
                                    )} text-white`}>
                                    {submission.status}
                                  </Badge>
                                  {submission.category && (
                                    <Badge variant="outline">
                                      {submission.category}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDownload(
                                        submission.media,
                                        `submission-${submission.id}`
                                      )
                                    }>
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(submission.media, "_blank")
                                    }>
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Open
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">
                                Submitted:{" "}
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Side - Profile Card (takes 1 of 3 columns) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Profile Information
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <Avatar className="w-50 h-50">
                    <AvatarImage
                      src={
                        !isVideo(profile.photo || "")
                          ? profile.photo || "/placeholder.svg"
                          : "/placeholder.svg"
                      }
                      alt={profile.name || "Profile"}
                    />
                    <AvatarFallback className="text-2xl">
                      {profile.name?.charAt(0)?.toUpperCase() ||
                        profile.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}>
                          <Camera className="w-4 h-4" />
                        </Button>
                        {profile.photo && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleDeletePhoto}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedProfile.name || ""}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="mt-1 text-lg text-gray-900">
                      {profile.name || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email || ""}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="mt-1 text-lg text-gray-900">
                      {profile.email || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={editedProfile.phone || ""}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="mt-1 text-lg text-gray-900">
                      {profile.phone || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <p
                  className={`mt-1 text-lg font-medium ${
                    profile.isActive ? "text-green-600" : "text-red-600"
                  }`}>
                  {profile.isActive ? "Active" : "Banned"}
                </p>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1">
                    <Save className="w-4 h-4 mr-1" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile(profile);
                    }}
                    disabled={isSaving}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
