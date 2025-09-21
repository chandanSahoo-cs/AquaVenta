import Dexie, { Table } from "dexie";

export interface PendingUpload {
  id: string;
  file: File; // stored as Blob
  description: string;
  coords?: { lat: number; lon: number };
  createdAt: number;
  synced: boolean;
}

export class AppDB extends Dexie {
  uploads!: Table<PendingUpload, string>;

  constructor() {
    super("disasterMediaDB");
    this.version(1).stores({
      uploads: "id, createdAt, synced",
    });
  }
}

export const db = new AppDB();
