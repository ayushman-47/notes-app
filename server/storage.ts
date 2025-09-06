import { type User, type InsertUser, type NotesRequest, type InsertNotesRequest, type DiamondNotes } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createNotesRequest(request: InsertNotesRequest & { generatedNotes?: DiamondNotes }): Promise<NotesRequest>;
  getNotesRequest(id: string): Promise<NotesRequest | undefined>;
  getRecentNotesRequests(limit?: number): Promise<NotesRequest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private notesRequests: Map<string, NotesRequest>;

  constructor() {
    this.users = new Map();
    this.notesRequests = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createNotesRequest(request: InsertNotesRequest & { generatedNotes?: DiamondNotes }): Promise<NotesRequest> {
    const id = randomUUID();
    const notesRequest: NotesRequest = {
      id,
      className: request.className,
      subject: request.subject,
      chapterName: request.chapterName || null,
      language: request.language,
      generatedNotes: request.generatedNotes || null,
      createdAt: new Date(),
    };
    this.notesRequests.set(id, notesRequest);
    return notesRequest;
  }

  async getNotesRequest(id: string): Promise<NotesRequest | undefined> {
    return this.notesRequests.get(id);
  }

  async getRecentNotesRequests(limit = 10): Promise<NotesRequest[]> {
    return Array.from(this.notesRequests.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
