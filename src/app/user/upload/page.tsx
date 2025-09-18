"use client";

import { uploadMedia } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { FileImage, Loader2, MapPin, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Detecting location...");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Auto-detect location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lon: longitude }); // Store the coordinates

          // Fetch readable address for display purposes only
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            );
            const data = await response.json();
            if (data && data.display_name) {
              setLocation(data.display_name);
            } else {
              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (error) {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        },
        () => {
          setLocation("Enable location services or enter manually.");
        },
      );
    } else {
      setLocation("Location detection not supported.");
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !coords) {
      setMessage("File and location are required.");
      return;
    }

    setUploading(true)
    setMessage("")
    setUploadSuccess(false)

    try {
      const storageRef = ref(storage, `media/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      const formData = new FormData();
      formData.append("description", description);
      formData.append("fileUrl", downloadURL);
      // Send coordinates instead of the location string
      formData.append("latitude", String(coords.lat));
      formData.append("longitude", String(coords.lon));

      const result = await uploadMedia(formData)

      if (result.success) {
        setMessage("Media uploaded successfully!")
        setUploadSuccess(true)
      } else {
        setMessage(result?.error || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error)
      setMessage("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      {/* Left Side - Upload Area */}
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Upload Disaster Media
            </h1>
            <p className="text-lg text-muted-foreground">
              Share your observations to help communities and responders
            </p>
          </div>

          <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-enterprise-lg">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}>
              <input
                type="file"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*,video/*"
              />

              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>

                <div>
                  <p className="text-lg font-medium text-foreground mb-2">
                    Drop a file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports images and video files
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <div className="mt-6 space-y-2">
                <Label className="text-sm font-medium">Selected File:</Label>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FileImage className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-destructive hover:text-destructive/80 text-sm font-medium flex-shrink-0 ml-4">
                    Remove
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <Card className="w-full max-w-md p-8 shadow-enterprise-lg">
          {uploadSuccess ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Upload Successful</h2>
              <div>
                <Alert className="border-success/30 bg-success/10 rounded-xl">
                  <AlertDescription className="text-success font-medium text-base">
                    {message}
                  </AlertDescription>
                </Alert>
              </div>
              <Link
                href="/user/gallery"
                className="w-full inline-block bg-primary text-primary-foreground py-2.5 px-4 rounded-md hover:bg-primary/90 transition-colors font-semibold">
                View Gallery
              </Link>
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                className="w-full py-2.5 h-auto">
                Upload Another File
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Submission Details
                </h2>
                <p className="text-muted-foreground">
                  Add context to your media
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the event, conditions, and any relevant details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-32 resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-12 pr-10 bg-muted/50"
                    />
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Location is auto-detected. You can also enter it manually.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={!file || !description.trim() || uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Media"
                  )}
                </Button>

                {message && !uploadSuccess && (
                  <div className="alert alert-error text-center">
                    {message}
                  </div>
                )}
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
