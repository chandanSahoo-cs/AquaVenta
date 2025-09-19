"use client";

import { useEffect, useState } from "react";
import { getUserMedia, deleteReportFromDb } from "@/actions/media";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Play, Trash2, CheckCircle, Clock } from "lucide-react";
import { LocationDisplay } from "@/components/LocationDisplay";

// Define the Submission type based on what getUserMedia returns
interface Submission {
  id: string;
  media: string;
  status: string;
  severity: number;
  submittedAt: string | Date;
  category?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export default function UserSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"verified" | "other">("verified");

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
      window.URL.revokeObjectURL(blobUrl); // Clean up
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    const loadSubmissions = async () => {
      setIsLoading(true);
      try {
        // The result from the server action is already an array of submissions
        const media = await getUserMedia();
        setSubmissions(media);
      } catch (error) {
        console.error("Failed to load submissions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSubmissions();
  }, []);

  const verifiedSubmissions = submissions.filter((s) => s.status === "verified");
  const otherSubmissions = submissions.filter((s) => s.status !== "verified");

  const isVideo = (url: string) => {
    const cleanUrl = url ? url.split("?")[0] : "";
    return cleanUrl && /\.(mp4|webm|mov|ogg|avi)$/i.test(cleanUrl);
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

  const handleDelete = async (submissionId: string) => {
    try {
      if(!window.confirm("Are you sure you want to permanently delete this submission?")) {
        return;
      }
      const result = await deleteReportFromDb(submissionId);
      if (result.success){
        setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      } else {
        alert(`Failed to delete submission: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to delete submission:", error);
    }
  };

  const renderSubmissionGrid = (items: Submission[]) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg aspect-square animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <p className="text-center text-gray-500 py-8">
          No submissions found.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((submission) => {
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
                    <Image
                      src={submission.media}
                      alt={submission.description || "Submission"}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge
                      className={`${getStatusColor(
                        submission.status
                      )} text-white text-xs`}
                    >
                      {submission.status}
                    </Badge>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogTitle className="sr-only">Submission Preview</DialogTitle>
                <div className="relative">
                  {isVideoResult ? (
                    <video
                      src={submission.media}
                      controls
                      autoPlay
                      className="w-full max-h-[70vh] object-contain"
                    />
                  ) : (
                    <Image
                      src={submission.media}
                      alt={submission.description || "Submission"}
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
                          )} text-white`}
                        >
                          {submission.status}
                        </Badge>
                        {submission.category && (
                          <Badge variant="outline">{submission.category}</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(submission.media, `submission-${submission.id}`)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(submission.media, "_blank")
                          }
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Open
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(submission.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Submitted:{" "}
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                    {submission.description && (
                      <p className="text-sm mt-1">{submission.description}</p>
                    )}
                    <LocationDisplay
                    latitude={submission.latitude}
                    longitude={submission.longitude}
                    className="text-sm text-muted-foreground mt-1"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Submissions</h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setView("verified")}
              variant={view === "verified" ? "default" : "outline"}
              className="w-full sm:w-auto"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Verified Submissions
            </Button>
            <Button
              onClick={() => setView("other")}
              variant={view === "other" ? "default" : "outline"}
              className="w-full sm:w-auto"
            >
              <Clock className="w-5 h-5 mr-2" />
              Pending & Other
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {view === "verified"
            ? renderSubmissionGrid(verifiedSubmissions)
            : renderSubmissionGrid(otherSubmissions)}
        </CardContent>
      </Card>
    </div>
  );
}