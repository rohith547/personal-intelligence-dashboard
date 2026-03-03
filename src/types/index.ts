export type Priority = 'low' | 'medium' | 'high';
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface FitnessEntry {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories?: number;
  notes?: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface SpendingEntry {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'expense' | 'income';
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodLevel;
  energy: EnergyLevel;
  notes?: string;
  tags: string[];
  sleepHours?: number;
  activities: string[];
}

export interface LearningEntry {
  id: string;
  date: string;
  topic: string;
  source: string;
  duration: number;
  notes?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface ReadingEntry {
  id: string;
  title: string;
  author: string;
  status: 'want-to-read' | 'reading' | 'completed' | 'abandoned';
  startedAt?: string;
  completedAt?: string;
  pagesTotal?: number;
  pagesRead?: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  genre: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  targetDate: string;
  progress: number;
  milestones: Milestone[];
  createdAt: string;
  status: 'active' | 'completed' | 'paused';
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface CodeCommit {
  id: string;
  date: string;
  repo: string;
  message: string;
  linesAdded: number;
  linesRemoved: number;
  language: string;
  timeSpentMinutes?: number;
}

export interface DailyInsight {
  date: string;
  productivityScore: number;
  moodAvg: number;
  energyAvg: number;
  tasksCompleted: number;
  focusHours: number;
  insights: string[];
}
