import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Conversation model
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  createTime: timestamp("create_time").notNull().defaultNow(),
  lastMessageId: text("last_message_id").notNull(),
  botId: text("bot_id"),
  userId: integer("user_id").references(() => users.id),
  shouldContinue: boolean("should_continue").default(false),
  messageMap: jsonb("message_map").default({})
});

// Message model
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createTime: timestamp("create_time").notNull().defaultNow(),
});

// Schemas for insert operations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  id: true,
  title: true,
  lastMessageId: true,
  botId: true,
  userId: true,
  shouldContinue: true,
  messageMap: true
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  id: true,
  conversationId: true,
  role: true,
  content: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
