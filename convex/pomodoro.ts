import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .unique();

    if (!settings) {
      // Return default settings
      return {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        soundEnabled: true,
        notificationsEnabled: true,
        theme: "dark" as const,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        dailyGoal: 8,
      };
    }

    return {
      ...settings,
      autoStartBreaks: settings.autoStartBreaks ?? false,
      autoStartPomodoros: settings.autoStartPomodoros ?? false,
      dailyGoal: settings.dailyGoal ?? 8,
    };
  },
});

export const updateSettings = mutation({
  args: {
    workDuration: v.number(),
    shortBreakDuration: v.number(),
    longBreakDuration: v.number(),
    sessionsUntilLongBreak: v.number(),
    soundEnabled: v.boolean(),
    notificationsEnabled: v.boolean(),
    theme: v.union(v.literal("light"), v.literal("dark")),
    autoStartBreaks: v.optional(v.boolean()),
    autoStartPomodoros: v.optional(v.boolean()),
    dailyGoal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("settings", { userId: userId as Id<"users">, ...args });
    }

    // Apply theme to document
    if (typeof document !== "undefined") {
      if (args.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  },
});

export const saveSession = mutation({
  args: {
    type: v.union(v.literal("work"), v.literal("break"), v.literal("longBreak")),
    duration: v.number(),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = new Date();
    const date = now.toISOString().split('T')[0];

    await ctx.db.insert("sessions", {
      userId: userId as Id<"users">,
      type: args.type,
      duration: args.duration,
      completedAt: now.getTime(),
      date,
      taskId: args.taskId,
    });

    // Update task progress if taskId provided
    if (args.taskId && args.type === "work") {
      const task = await ctx.db.get(args.taskId);
      if (task && task.userId === (userId as Id<"users">)) {
        await ctx.db.patch(args.taskId, {
          completedPomodoros: task.completedPomodoros + 1,
        });
      }
    }

    // Check for achievements
    await checkAchievements(ctx, userId as Id<"users">);
  },
});

async function checkAchievements(ctx: MutationCtx, userId: Id<"users">) {
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = await ctx.db
    .query("sessions")
    .withIndex("by_user_and_date", (q) => q.eq("userId", userId as Id<"users">).eq("date", today))
    .filter((q) => q.eq(q.field("type"), "work"))
    .collect();

  const totalSessions = await ctx.db
    .query("sessions")
    .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
    .filter((q) => q.eq(q.field("type"), "work"))
    .collect();

  const achievements = [
    {
      type: "first_session",
      title: "Getting Started",
      description: "Complete your first Pomodoro session",
      icon: "🎯",
      condition: totalSessions.length >= 1,
    },
    {
      type: "daily_5",
      title: "Focused Day",
      description: "Complete 5 sessions in one day",
      icon: "🔥",
      condition: todaySessions.length >= 5,
    },
    {
      type: "daily_10",
      title: "Productivity Master",
      description: "Complete 10 sessions in one day",
      icon: "⚡",
      condition: todaySessions.length >= 10,
    },
    {
      type: "total_50",
      title: "Dedicated Learner",
      description: "Complete 50 total sessions",
      icon: "📚",
      condition: totalSessions.length >= 50,
    },
    {
      type: "total_100",
      title: "Focus Champion",
      description: "Complete 100 total sessions",
      icon: "🏆",
      condition: totalSessions.length >= 100,
    },
  ];

  for (const achievement of achievements) {
    if (achievement.condition) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
        .filter((q) => q.eq(q.field("type"), achievement.type))
        .unique();

      if (!existing) {
        await ctx.db.insert("achievements", {
          userId: userId as Id<"users">,
          type: achievement.type,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          unlockedAt: Date.now(),
        });
      }
    }
  }
}

export const getTodayStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const today = new Date().toISOString().split('T')[0];
    
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId as Id<"users">).eq("date", today))
      .collect();

    const workSessions = sessions.filter(s => s.type === "work").length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    // Get daily goal
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .unique();

    const dailyGoal = settings?.dailyGoal || 8;

    return {
      workSessions,
      totalMinutes,
      totalSessions: sessions.length,
      dailyGoal,
      goalProgress: Math.min((workSessions / dailyGoal) * 100, 100),
    };
  },
});

export const getWeeklyStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId as Id<"users">))
      .filter((q) => q.gte(q.field("completedAt"), weekAgo.getTime()))
      .collect();

    const dailyStats = new Map();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats.set(dateStr, { date: dateStr, sessions: 0, minutes: 0 });
    }

    sessions.forEach(session => {
      const stats = dailyStats.get(session.date);
      if (stats && session.type === "work") {
        stats.sessions++;
        stats.minutes += session.duration;
      }
    });

    return Array.from(dailyStats.values()).reverse();
  },
});

export const getAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .order("desc")
      .collect();
  },
});

// Task management functions
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    estimatedPomodoros: v.number(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    category: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("tasks", {
      userId: userId as Id<"users">,
      ...args,
      completed: false,
      completedPomodoros: 0,
      createdAt: Date.now(),
    });
  },
});

export const getTasks = query({
  args: { completed: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">));

    if (args.completed !== undefined) {
      query = ctx.db
        .query("tasks")
        .withIndex("by_user_and_completed", (q) => 
          q.eq("userId", userId as Id<"users">).eq("completed", args.completed!)
        );
    }

    return await query.order("desc").collect();
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    estimatedPomodoros: v.optional(v.number()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    category: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { taskId, ...updates } = args;
    const task = await ctx.db.get(taskId);
    
    if (!task || task.userId !== (userId as Id<"users">)) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.patch(taskId, updates);
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== (userId as Id<"users">)) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.delete(args.taskId);
  },
});
