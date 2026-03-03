import type { Task, MoodEntry, SpendingEntry, FitnessEntry, ReadingEntry } from '../types';

export function getMostProductiveHours(tasks: Task[]): { hour: number; score: number }[] {
  const hourCounts: Record<number, number> = {};
  tasks
    .filter((t) => t.completed && t.completedAt)
    .forEach((t) => {
      const hour = new Date(t.completedAt!).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
  const max = Math.max(...Object.values(hourCounts), 1);
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    score: Math.round(((hourCounts[h] || 0) / max) * 100),
  }));
}

export function getEnergyDrainByCategory(
  tasks: Task[],
  moodEntries: MoodEntry[]
): { category: string; avgMoodAfter: number }[] {
  const categories = [...new Set(tasks.map((t) => t.category))];
  return categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat && t.completedAt);
    if (catTasks.length === 0) return { category: cat, avgMoodAfter: 3 };
    const moodAfterList = catTasks.map((t) => {
      const completedDate = t.completedAt!.split('T')[0];
      const entry = moodEntries.find((m) => m.date === completedDate);
      return entry ? entry.mood : 3;
    });
    const avg = moodAfterList.reduce((a, b) => a + b, 0) / moodAfterList.length;
    return { category: cat, avgMoodAfter: Math.round(avg * 10) / 10 };
  });
}

export function getFocusCorrelations(
  tasks: Task[],
  moodEntries: MoodEntry[]
): { habit: string; focusScore: number }[] {
  const habitMap: Record<string, number[]> = {};
  moodEntries.forEach((m) => {
    const dayTasks = tasks.filter(
      (t) => t.completed && t.completedAt && t.completedAt.startsWith(m.date)
    );
    const score = dayTasks.length * 10 + m.energy * 5;
    m.activities.forEach((act) => {
      if (!habitMap[act]) habitMap[act] = [];
      habitMap[act].push(score);
    });
  });
  return Object.entries(habitMap).map(([habit, scores]) => ({
    habit,
    focusScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));
}

export function getSleepVsProductivity(
  moodEntries: MoodEntry[],
  tasks: Task[]
): { sleepHours: number; avgTasksCompleted: number }[] {
  const buckets: Record<number, number[]> = {};
  moodEntries.forEach((m) => {
    if (m.sleepHours == null) return;
    const bucket = Math.round(m.sleepHours);
    const dayCompleted = tasks.filter(
      (t) => t.completed && t.completedAt && t.completedAt.startsWith(m.date)
    ).length;
    if (!buckets[bucket]) buckets[bucket] = [];
    buckets[bucket].push(dayCompleted);
  });
  return Object.entries(buckets).map(([h, counts]) => ({
    sleepHours: Number(h),
    avgTasksCompleted: Math.round((counts.reduce((a, b) => a + b, 0) / counts.length) * 10) / 10,
  }));
}

export function getWeeklyProductivityTrend(tasks: Task[]): { week: string; score: number }[] {
  const weekMap: Record<string, number> = {};
  tasks
    .filter((t) => t.completed && t.completedAt)
    .forEach((t) => {
      const d = new Date(t.completedAt!);
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      const key = startOfWeek.toISOString().split('T')[0];
      weekMap[key] = (weekMap[key] || 0) + 1;
    });
  return Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, score: count * 10 }));
}

export function getSpendingInsights(
  entries: SpendingEntry[]
): { topCategory: string; weeklyAvg: number; trend: 'up' | 'down' | 'stable' } {
  const expenses = entries.filter((e) => e.type === 'expense');
  if (expenses.length === 0) return { topCategory: 'None', weeklyAvg: 0, trend: 'stable' };
  const catMap: Record<string, number> = {};
  expenses.forEach((e) => {
    catMap[e.category] = (catMap[e.category] || 0) + e.amount;
  });
  const topCategory = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'None';
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const dates = expenses.map((e) => new Date(e.date).getTime());
  const spanDays =
    dates.length > 1
      ? (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)
      : 7;
  const weeklyAvg = spanDays > 0 ? Math.round((totalAmount / spanDays) * 7) : totalAmount;

  const recent = expenses.filter(
    (e) => new Date(e.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const recentTotal = recent.reduce((s, e) => s + e.amount, 0);
  const trend: 'up' | 'down' | 'stable' =
    recentTotal > weeklyAvg * 1.1 ? 'up' : recentTotal < weeklyAvg * 0.9 ? 'down' : 'stable';
  return { topCategory, weeklyAvg, trend };
}

export function getReadingVelocity(books: ReadingEntry[]): {
  booksPerMonth: number;
  avgRating: number;
} {
  const completed = books.filter((b) => b.status === 'completed' && b.completedAt);
  if (completed.length === 0) return { booksPerMonth: 0, avgRating: 0 };
  const dates = completed.map((b) => new Date(b.completedAt!).getTime());
  const spanMonths =
    completed.length > 1
      ? (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24 * 30)
      : 1;
  const booksPerMonth =
    spanMonths > 0 ? Math.round((completed.length / spanMonths) * 10) / 10 : completed.length;
  const rated = completed.filter((b) => b.rating != null);
  const avgRating =
    rated.length > 0
      ? Math.round((rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length) * 10) / 10
      : 0;
  return { booksPerMonth, avgRating };
}

export function generateInsightSummary(data: {
  tasks: Task[];
  mood: MoodEntry[];
  fitness: FitnessEntry[];
}): string[] {
  const insights: string[] = [];
  const { tasks, mood, fitness } = data;

  const completedToday = tasks.filter(
    (t) =>
      t.completed &&
      t.completedAt &&
      t.completedAt.startsWith(new Date().toISOString().split('T')[0])
  ).length;
  if (completedToday > 0) {
    insights.push(`You completed ${completedToday} task${completedToday > 1 ? 's' : ''} today. Keep the momentum!`);
  }

  if (mood.length >= 3) {
    const recent = mood.slice(-3);
    const avgMood = recent.reduce((s, m) => s + m.mood, 0) / recent.length;
    if (avgMood >= 4) insights.push('Your mood has been great lately! 🌟');
    else if (avgMood <= 2) insights.push('Your mood has been low recently. Consider a self-care day.');
  }

  if (mood.length >= 2) {
    const withSleep = mood.filter((m) => m.sleepHours != null);
    if (withSleep.length >= 2) {
      const avgSleep = withSleep.reduce((s, m) => s + (m.sleepHours ?? 0), 0) / withSleep.length;
      if (avgSleep < 7) insights.push(`Average sleep is ${avgSleep.toFixed(1)}h — aim for 7-9 hours for peak performance.`);
    }
  }

  const thisWeek = fitness.filter((f) => {
    const d = new Date(f.date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    return d >= weekStart;
  });
  if (thisWeek.length >= 3) {
    insights.push(`Great job! You've worked out ${thisWeek.length} times this week.`);
  } else if (thisWeek.length === 0) {
    insights.push('No workouts logged this week yet. Your body will thank you!');
  }

  const pending = tasks.filter((t) => !t.completed);
  const overdue = pending.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());
  if (overdue.length > 0) {
    insights.push(`You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}. Consider tackling them first.`);
  }

  if (insights.length === 0) {
    insights.push('Start logging your daily activities to unlock personalized insights!');
  }

  return insights;
}
