import { initializeApp, FirebaseApp } from "firebase/app"
import { getStorage, FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp
let storage: FirebaseStorage

try {
  if (typeof window !== "undefined") {
    // Client-side initialization
    app = initializeApp(firebaseConfig)
    storage = getStorage(app)
  }
} catch (error) {
  console.error("Firebase initialization error:", error)
}

export { storage }
