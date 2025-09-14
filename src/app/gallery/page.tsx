import { getAllMedia } from "@/actions/media"
import Link from "next/link"
import { Report } from "../../../generated/prisma"

type MediaItem = Report & {
  user: {
    name: string | null
  } | null
}

export default async function GalleryPage() {
  const media = await getAllMedia()

  // Helper function to extract a readable filename from the Firebase URL
  const getFileNameFromUrl = (url: string) => {
    try {
      const path = new URL(url).pathname
      const decodedPath = decodeURIComponent(path)
      // The filename is the last part of the path after the last '/'
      const fileNameWithFolder = decodedPath.substring(decodedPath.lastIndexOf("/") + 1)
      // Remove the folder prefix if it exists (e.g., 'media/')
      return fileNameWithFolder.substring(fileNameWithFolder.lastIndexOf("/") + 1)
    } catch (_e) {
      return "media_file" // Fallback name
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="card shadow-enterprise-lg max-w-6xl mx-auto">
        <div className="card-header text-center">
          <div className="flex justify-center items-center relative">
            <Link
              href="/"
              className="absolute left-0 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors font-semibold"
            >
              Home
            </Link>
            <h1 className="text-4xl font-bold mb-2">Disaster Media Gallery</h1>
            <Link
              href="/upload"
              className="absolute right-0 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/80 transition-colors font-semibold"
            >
              Upload Media
            </Link>
          </div>
          <p className="text-muted-foreground mb-4">
            Browse community-shared disaster photos and videos.
          </p>
        </div>
        <div className="card-content">
          {media.length === 0 ? (
            <div className="alert alert-info text-center">
              No media uploaded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {(media as MediaItem[]).map((item) => (
                <div key={item.id} className="card shadow-enterprise p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-grow">
                    <a
                      href={item.media}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-primary hover:underline break-all"
                    >
                      {getFileNameFromUrl(item.media)}
                    </a>
                    {item.description && (
                      <p className="text-foreground mt-1">{item.description}</p>
                    )}
                    {item.location && (
                      <p className="text-sm text-muted-foreground mt-1">📍 {item.location}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-3 sm:mt-0 sm:ml-4 text-left sm:text-right flex-shrink-0">
                    <div>
                      Uploaded by: <span className="font-semibold">{item.user?.name || "Anonymous"}</span>
                    </div>
                    <div>
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
