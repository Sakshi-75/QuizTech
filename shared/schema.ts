import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  skillLevel: varchar("skill_level").default("beginner"),
  topics: text("topics").array().default([]),
  points: integer("points").default(0),
  streak: integer("streak").default(0),
  lastQuizDate: date("last_quiz_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contentItems = pgTable("content_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // 'lesson' or 'question'
  topicId: varchar("topic_id").references(() => topics.id),
  difficulty: varchar("difficulty").notNull().default("medium"), // beginner, intermediate, advanced
  title: text("title").notNull(),
  body: text("body").notNull(),
  codeSnippet: text("code_snippet"),
  explanation: text("explanation"),
  options: jsonb("options"), // for questions: array of options
  correctAnswer: varchar("correct_answer"), // for questions
  tags: text("tags").array().default([]),
  source: varchar("source").default("admin"), // admin, ai, web
  reviewed: boolean("reviewed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  date: date("date").notNull(),
  questions: text("questions").array().notNull(), // array of contentItem IDs
  score: integer("score").default(0),
  totalQuestions: integer("total_questions").default(6),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attempts = pgTable("attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  questionId: varchar("question_id").references(() => contentItems.id),
  quizId: varchar("quiz_id").references(() => quizzes.id),
  selectedOption: varchar("selected_option"),
  correct: boolean("correct").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  criteria: text("criteria"),
  icon: varchar("icon").default("🏆"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  badgeId: varchar("badge_id").references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const leaderboards = pgTable("leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  period: varchar("period").notNull(), // weekly, monthly
  points: integer("points").notNull(),
  rank: integer("rank"),
  periodStart: date("period_start").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  quizzes: many(quizzes),
  attempts: many(attempts),
  userBadges: many(userBadges),
  leaderboards: many(leaderboards),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  contentItems: many(contentItems),
}));

export const contentItemsRelations = relations(contentItems, ({ one, many }) => ({
  topic: one(topics, {
    fields: [contentItems.topicId],
    references: [topics.id],
  }),
  attempts: many(attempts),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  user: one(users, {
    fields: [quizzes.userId],
    references: [users.id],
  }),
  attempts: many(attempts),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  user: one(users, {
    fields: [attempts.userId],
    references: [users.id],
  }),
  question: one(contentItems, {
    fields: [attempts.questionId],
    references: [contentItems.id],
  }),
  quiz: one(quizzes, {
    fields: [attempts.quizId],
    references: [quizzes.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  user: one(users, {
    fields: [leaderboards.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
});

export const insertContentItemSchema = createInsertSchema(contentItems).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertAttemptSchema = createInsertSchema(attempts).omit({
  id: true,
  createdAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type ContentItem = typeof contentItems.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type Leaderboard = typeof leaderboards.$inferSelect;

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
