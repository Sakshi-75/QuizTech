import {
  users,
  topics,
  contentItems,
  quizzes,
  attempts,
  badges,
  userBadges,
  leaderboards,
  type User,
  type UpsertUser,
  type Topic,
  type ContentItem,
  type Quiz,
  type Attempt,
  type Badge,
  type UserBadge,
  type Leaderboard,
  type InsertTopic,
  type InsertContentItem,
  type InsertQuiz,
  type InsertAttempt,
  type InsertBadge,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Topic operations
  getTopics(): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Content operations
  getContentItems(topicId?: string, type?: string): Promise<ContentItem[]>;
  createContentItem(item: InsertContentItem): Promise<ContentItem>;
  updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem | undefined>;
  deleteContentItem(id: string): Promise<boolean>;
  
  // Quiz operations
  getTodayQuiz(userId: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | undefined>;
  getUserQuizHistory(userId: string): Promise<Quiz[]>;
  
  // Attempt operations
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  getQuizAttempts(quizId: string): Promise<Attempt[]>;
  
  // Badge operations
  getBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  
  // Leaderboard operations
  getLeaderboard(period: 'weekly' | 'monthly', limit?: number): Promise<Leaderboard[]>;
  updateUserStreak(userId: string): Promise<void>;
  updateUserPoints(userId: string, points: number): Promise<void>;
  
  // Daily lesson
  getTodayLesson(userId: string): Promise<ContentItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Topic operations
  async getTopics(): Promise<Topic[]> {
    return await db.select().from(topics);
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const [newTopic] = await db.insert(topics).values(topic).returning();
    return newTopic;
  }

  // Content operations
  async getContentItems(topicId?: string, type?: string): Promise<ContentItem[]> {
    if (topicId && type) {
      return await db.select().from(contentItems).where(and(eq(contentItems.topicId, topicId), eq(contentItems.type, type)));
    } else if (topicId) {
      return await db.select().from(contentItems).where(eq(contentItems.topicId, topicId));
    } else if (type) {
      return await db.select().from(contentItems).where(eq(contentItems.type, type));
    }
    
    return await db.select().from(contentItems);
  }

  async createContentItem(item: InsertContentItem): Promise<ContentItem> {
    const [newItem] = await db.insert(contentItems).values(item).returning();
    return newItem;
  }

  async updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem | undefined> {
    const [updated] = await db
      .update(contentItems)
      .set(updates)
      .where(eq(contentItems.id, id))
      .returning();
    return updated;
  }

  async deleteContentItem(id: string): Promise<boolean> {
    const result = await db.delete(contentItems).where(eq(contentItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Quiz operations
  async getTodayQuiz(userId: string): Promise<Quiz | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.userId, userId), eq(quizzes.date, today)));
    return quiz;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | undefined> {
    const [updated] = await db
      .update(quizzes)
      .set(updates)
      .where(eq(quizzes.id, id))
      .returning();
    return updated;
  }

  async getUserQuizHistory(userId: string): Promise<Quiz[]> {
    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.date));
  }

  // Attempt operations
  async createAttempt(attempt: InsertAttempt): Promise<Attempt> {
    const [newAttempt] = await db.insert(attempts).values(attempt).returning();
    return newAttempt;
  }

  async getQuizAttempts(quizId: string): Promise<Attempt[]> {
    return await db
      .select()
      .from(attempts)
      .where(eq(attempts.quizId, quizId));
  }

  // Badge operations
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db.insert(badges).values(badge).returning();
    return newBadge;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [userBadge] = await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .returning();
    return userBadge;
  }

  // Leaderboard operations
  async getLeaderboard(period: 'weekly' | 'monthly', limit = 10): Promise<Leaderboard[]> {
    return await db
      .select()
      .from(leaderboards)
      .where(eq(leaderboards.period, period))
      .orderBy(desc(leaderboards.points))
      .limit(limit);
  }

  async updateUserStreak(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let newStreak = 1;
    
    if (user.lastQuizDate === yesterday) {
      newStreak = (user.streak || 0) + 1;
    } else if (user.lastQuizDate === today) {
      // Already did quiz today, no change
      return;
    }

    await db
      .update(users)
      .set({ 
        streak: newStreak, 
        lastQuizDate: today,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        points: sql`${users.points} + ${points}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Daily lesson
  async getTodayLesson(userId: string): Promise<ContentItem | undefined> {
    // Get a random lesson for now - in production, this would be more sophisticated
    const lessons = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.type, 'lesson'))
      .limit(1);
    
    return lessons[0];
  }
}

export const storage = new DatabaseStorage();
