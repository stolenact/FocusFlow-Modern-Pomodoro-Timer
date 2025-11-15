import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  sessions: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("work"), v.literal("break"), v.literal("longBreak")),
    duration: v.number(),
    completedAt: v.number(),
    date: v.string(), // YYYY-MM-DD format
    taskId: v.optional(v.id("tasks")),
  }).index("by_user_and_date", ["userId", "date"])
    .index("by_user", ["userId"]),
  
  settings: defineTable({
    userId: v.id("users"),
    workDuration: v.number(), // in minutes
    shortBreakDuration: v.number(),
    longBreakDuration: v.number(),
    sessionsUntilLongBreak: v.number(),
    soundEnabled: v.boolean(),
    notificationsEnabled: v.boolean(),
    theme: v.union(v.literal("light"), v.literal("dark")),
    autoStartBreaks: v.optional(v.boolean()),
    autoStartPomodoros: v.optional(v.boolean()),
    dailyGoal: v.optional(v.number()), // sessions per day
  }).index("by_user", ["userId"]),

  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    estimatedPomodoros: v.number(),
    completedPomodoros: v.number(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    category: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_completed", ["userId", "completed"]),

  achievements: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    unlockedAt: v.number(),
    icon: v.string(),
  }).index("by_user", ["userId"]),

  goals: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    target: v.number(),
    current: v.number(),
    period: v.string(), // YYYY-MM-DD for daily, YYYY-WW for weekly, YYYY-MM for monthly
    completed: v.boolean(),
  }).index("by_user_and_period", ["userId", "period"])
    .index("by_user_and_type", ["userId", "type"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
