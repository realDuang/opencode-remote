import fs from "fs";
import path from "path";

const STORAGE_FILE = path.join(process.cwd(), ".remote-storage.json");

export interface RemoteStorage {
  [key: string]: string;
}

class StorageStore {
  private data: RemoteStorage = {};

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        this.data = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf-8"));
      }
    } catch (e) {
      console.error("[StorageStore] Failed to load storage:", e);
      this.data = {};
    }
  }

  private save() {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error("[StorageStore] Failed to save storage:", e);
    }
  }

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  setItem(key: string, value: string) {
    this.data[key] = value;
    this.save();
  }

  removeItem(key: string) {
    delete this.data[key];
    this.save();
  }

  getAll(): RemoteStorage {
    return { ...this.data };
  }
}

export const storageStore = new StorageStore();
