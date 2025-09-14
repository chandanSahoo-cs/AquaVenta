"use client"

import { useState, useMemo } from "react"
import { uploadMedia } from "@/actions/media"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import Link from "next/link"
import Image from "next/image"

// Helper Icon Components
const UploadCloudIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
)

const FileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  const handleReset = () => {
    setFile(null)
    setDescription("")
    setLocation("")
    setMessage("")
    setUploadSuccess(false)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setMessage("")
    setUploadSuccess(false)

    try {
      const storageRef = ref(storage, `media/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("description", description)
      formData.append("location", location)
      formData.append("userId", "")
      formData.append("fileUrl", downloadURL)

      const result = await uploadMedia(formData)

      if (result.success) {
        setMessage("Media uploaded successfully!")
        setUploadSuccess(true)
      } else {
        setMessage(result.error || "Upload failed. Please try again.")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setMessage("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="card max-w-2xl mx-auto shadow-enterprise-lg">
        <div className="card-header text-center relative border-b border-border">
          <Link href="/" className="absolute left-4 top-1/2 -translate-y-1/2 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors font-semibold text-sm">
            Home
          </Link>
          <h1 className="text-3xl font-bold">Upload Disaster Media</h1>
          <p className="text-muted-foreground mt-1">Share media to help your community and responders.</p>
        </div>

        {uploadSuccess ? (
          <div className="card-content text-center space-y-4 p-8">
            <div className="alert alert-success">{message}</div>
            <Link href="/gallery" className="w-full inline-block bg-primary text-primary-foreground py-2.5 px-4 rounded-md hover:bg-primary/90 transition-colors font-semibold">
              View Gallery
            </Link>
            <button onClick={handleReset} className="w-full bg-secondary text-secondary-foreground py-2.5 px-4 rounded-md hover:bg-secondary/80 transition-colors font-semibold">
              Upload Another File
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-content p-8 space-y-6">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-foreground mb-2">
                Media File <span className="text-destructive">*</span>
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10">
                {previewUrl ? (
                  <div className="text-center">
                    {file?.type.startsWith("image/") ? (
                      <Image src={previewUrl} alt="Preview" width={200} height={200} className="mx-auto h-24 w-auto rounded-md object-cover" />
                    ) : (
                      <FileIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    )}
                    <p className="mt-2 text-sm text-foreground">{file?.name}</p>
                    <button type="button" onClick={() => setFile(null)} className="text-sm font-semibold text-destructive hover:text-destructive/80 mt-1">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloudIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} accept="image/*,video/*" required />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, GIF, MP4 up to 50MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="input w-full" rows={4} placeholder="Describe what you captured, where it is, and what's happening." />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-foreground">Location</label>
              <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="input w-full" placeholder="e.g., City, State or specific address" />
            </div>

            <button type="submit" disabled={!file || uploading} className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-md hover:bg-primary/90 transition-colors font-semibold disabled:bg-muted disabled:cursor-not-allowed">
              {uploading ? "Uploading..." : "Submit Media"}
            </button>

            {message && !uploadSuccess && <div className="alert alert-error text-center">{message}</div>}
          </form>
        )}
      </div>
    </div>
  )
}
