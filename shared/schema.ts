import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const notesRequests = pgTable("notes_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  className: text("class_name").notNull(),
  subject: text("subject").notNull(),
  chapterName: text("chapter_name"),
  language: text("language").notNull(),
  generatedNotes: jsonb("generated_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNotesRequestSchema = createInsertSchema(notesRequests).pick({
  className: true,
  subject: true,
  chapterName: true,
  language: true,
});

export const generateNotesSchema = z.object({
  className: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  chapterName: z.string().optional(),
  language: z.enum(["english", "hindi"]),
  pdfContent: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertNotesRequest = z.infer<typeof insertNotesRequestSchema>;
export type NotesRequest = typeof notesRequests.$inferSelect;
export type GenerateNotesRequest = z.infer<typeof generateNotesSchema>;

export interface DiamondNotes {
  chapterTitle: string;
  headings: Array<{
    number: number;
    title: string;
    bulletPoints: string[];
  }>;
  conclusion: string;
  keywords: string[];
}
