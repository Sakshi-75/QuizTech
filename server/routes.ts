import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertTopicSchema,
  insertContentItemSchema,
  insertQuizSchema,
  insertAttemptSchema,
  insertBadgeSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Topic routes
  app.get('/api/topics', async (req, res) => {
    try {
      const topics = await storage.getTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  app.post('/api/topics', isAuthenticated, async (req, res) => {
    try {
      const topicData = insertTopicSchema.parse(req.body);
      const topic = await storage.createTopic(topicData);
      res.json(topic);
    } catch (error) {
      console.error("Error creating topic:", error);
      res.status(400).json({ message: "Failed to create topic" });
    }
  });

  // Content routes
  app.get('/api/content', async (req, res) => {
    try {
      const { topicId, type } = req.query;
      const content = await storage.getContentItems(
        topicId as string,
        type as string
      );
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.post('/api/content', isAuthenticated, async (req, res) => {
    try {
      const contentData = insertContentItemSchema.parse(req.body);
      const content = await storage.createContentItem(contentData);
      res.json(content);
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(400).json({ message: "Failed to create content" });
    }
  });

  app.put('/api/content/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const content = await storage.updateContentItem(id, updates);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error updating content:", error);
      res.status(400).json({ message: "Failed to update content" });
    }
  });

  app.delete('/api/content/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteContentItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // Quiz routes
  app.get('/api/quiz/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let quiz = await storage.getTodayQuiz(userId);
      
      if (!quiz) {
        // Create today's quiz
        const questions = await storage.getContentItems(undefined, 'question');
        const selectedQuestions = questions
          .sort(() => Math.random() - 0.5)
          .slice(0, 6)
          .map(q => q.id);
        
        const today = new Date().toISOString().split('T')[0];
        quiz = await storage.createQuiz({
          userId,
          date: today,
          questions: selectedQuestions,
          totalQuestions: 6,
        });
      }
      
      // Get full question data
      const questionIds = quiz.questions;
      const questionData = await Promise.all(
        questionIds.map(async (id) => {
          const questions = await storage.getContentItems();
          return questions.find(q => q.id === id);
        })
      );
      
      res.json({ ...quiz, questionData: questionData.filter(Boolean) });
    } catch (error) {
      console.error("Error fetching today's quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post('/api/quiz/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const { questionId, selectedOption } = req.body;
      
      // Get the question to check correct answer
      const questions = await storage.getContentItems();
      const question = questions.find(q => q.id === questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const correct = question.correctAnswer === selectedOption;
      
      // Create attempt
      await storage.createAttempt({
        userId,
        questionId,
        quizId: id,
        selectedOption,
        correct,
      });
      
      // Update quiz score and check if completed
      const attempts = await storage.getQuizAttempts(id);
      const quiz = await storage.updateQuiz(id, {
        score: attempts.filter(a => a.correct).length,
        completed: attempts.length >= 6,
      });
      
      // Update user points and streak if quiz completed
      if (quiz?.completed) {
        const points = (quiz.score || 0) * 10;
        const streakBonus = quiz.score === 6 ? 30 : 0; // Perfect score bonus
        
        await storage.updateUserPoints(userId, points + streakBonus);
        await storage.updateUserStreak(userId);
      }
      
      res.json({ 
        correct, 
        explanation: question.explanation,
        completed: quiz?.completed,
        score: quiz?.score 
      });
    } catch (error) {
      console.error("Error submitting quiz answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  app.get('/api/quiz/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getUserQuizHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      res.status(500).json({ message: "Failed to fetch quiz history" });
    }
  });

  // Lesson routes
  app.get('/api/lesson/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lesson = await storage.getTodayLesson(userId);
      res.json(lesson);
    } catch (error) {
      console.error("Error fetching today's lesson:", error);
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Badge routes
  app.get('/api/badges', async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get('/api/user/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  app.post('/api/badges', isAuthenticated, async (req, res) => {
    try {
      const badgeData = insertBadgeSchema.parse(req.body);
      const badge = await storage.createBadge(badgeData);
      res.json(badge);
    } catch (error) {
      console.error("Error creating badge:", error);
      res.status(400).json({ message: "Failed to create badge" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard/:period', async (req, res) => {
    try {
      const { period } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (period !== 'weekly' && period !== 'monthly') {
        return res.status(400).json({ message: "Invalid period" });
      }
      
      const leaderboard = await storage.getLeaderboard(period, limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Admin routes
  app.get('/api/admin/analytics', isAuthenticated, async (req, res) => {
    try {
      // Mock analytics data
      res.json({
        totalUsers: 150,
        dailyActiveUsers: 45,
        quizCompletionRate: 78,
        averageScore: 4.2,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
