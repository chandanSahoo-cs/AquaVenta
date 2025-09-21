import { uploadMedia } from "@/actions/media";
import { db } from "@/lib/db";
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect } from "react";
import { toast } from "sonner";

export function useSync() {
  useEffect(() => {
    async function syncUploads() {
      console.log("Sync is running");
      const pending = await db.uploads.where("synced").equals(0).toArray();

      for (const item of pending) {
        try {
          const storageRef = ref(
            storage,
            `media/${Date.now()}_${item.file.name}`
          );
          const snapshot = await uploadBytes(storageRef, item.file);
          const downloadURL = await getDownloadURL(snapshot.ref);

          const formData = new FormData();
          formData.append("description", item.description);
          formData.append("fileUrl", downloadURL);
          if (item.coords) {
            formData.append("latitude", String(item.coords.lat));
            formData.append("longitude", String(item.coords.lon));
          }

          const result = await uploadMedia(formData);

          if (result.success) {
            await db.uploads.update(item.id, { synced: 1 });
            toast.success("Offline synced data uploaded successfully");
          }
        } catch (err) {
          console.error("Sync failed for", item.id, err);
        }
      }
    }

    if (navigator.onLine) syncUploads();

    window.addEventListener("online", syncUploads);
    return () => window.removeEventListener("online", syncUploads);
  }, []);
}
