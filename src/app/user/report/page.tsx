"use client";

import { getAllVerifiedMedia } from "@/actions/media";
import { LocationDisplay } from "@/components/LocationDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, ExternalLink, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface MediaItem {
  id: string;
  media: string;
  status: string;
  severity: number;
  submittedAt: string | Date;
  category?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  user: {
    name: string | null;
  } | null;
}

export default function GalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      // Fallback for browsers that might block this, or for CORS issues
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      try {
        const result = await getAllVerifiedMedia();
        setMedia(result as MediaItem[]);
      } catch (error) {
        console.error("Failed to load gallery media:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMedia();
  }, []);

  const isVideo = (url: string) => {
    const cleanUrl = url ? url.split("?")[0] : "";
    return cleanUrl && /\.(mp4|webm|mov|ogg|avi)$/i.test(cleanUrl);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="shadow-lg max-w-7xl mx-auto">
        <CardHeader className="text-center">
          <h1 className="text-4xl font-bold mb-2">Disaster Alerts</h1>
          <p className="text-muted-foreground">
            Browse community-shared and verified disaster photos and videos.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-lg aspect-video animate-pulse"
                />
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No verified media has been uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((item) => {
                const isVideoResult = isVideo(item.media);
                return (
                  <Dialog key={item.id}>
                    <Card className="overflow-hidden">
                      <DialogTrigger asChild>
                        <div className="relative group cursor-pointer bg-gray-100 aspect-video">
                          {isVideoResult ? (
                            <>
                              <video
                                src={item.media}
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
                              src={item.media}
                              alt={item.description || "Gallery media"}
                              sizes="(max-width: 768px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform w-full h-full"
                            />
                          )}
                        </div>
                      </DialogTrigger>
                      <div className="p-4">
                        <p className="font-semibold truncate">
                          {item.description || "Untitled"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          By {item.user?.name || "Anonymous"} on{" "}
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                    <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                      <DialogTitle className="sr-only">
                        Media Preview
                      </DialogTitle>
                      <div className="relative">
                        {isVideoResult ? (
                          <video
                            src={item.media}
                            controls
                            autoPlay
                            className="w-full max-h-[70vh] object-contain"
                          />
                        ) : (
                          <img
                            src={item.media}
                            alt={item.description || "Gallery media"}
                            width={1200}
                            height={800}
                            className="w-full max-h-[70vh] object-contain"
                          />
                        )}
                        <div className="p-4 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">
                                {item.description || "Untitled"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Uploaded by {item.user?.name || "Anonymous"}
                              </p>
                              <LocationDisplay
                                latitude={item.latitude}
                                longitude={item.longitude}
                                className="text-sm text-muted-foreground mt-1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownload(item.media, `media-${item.id}`)
                                }>
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={item.media}
                                  target="_blank"
                                  rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Open
                                </a>
                              </Button>
                            </div>
                          </div>
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
    </div>
  );
}
