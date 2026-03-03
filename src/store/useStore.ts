import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Task,
  Note,
  FitnessEntry,
  SpendingEntry,
  MoodEntry,
  LearningEntry,
  ReadingEntry,
  Goal,
  CodeCommit,
} from '../types';
import { generateInsightSummary } from '../lib/insights';
import { supabase } from '../lib/supabase';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function daysAgoISO(n: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const SEED_TASKS: Task[] = [
  { id: uuidv4(), title: 'Review project proposal', description: 'Check the Q1 proposal doc', completed: true, priority: 'high', category: 'Work', createdAt: daysAgoISO(13), completedAt: daysAgoISO(13, 11), dueDate: daysAgo(12), estimatedMinutes: 30 },
  { id: uuidv4(), title: 'Go for a morning run', completed: true, priority: 'medium', category: 'Health', createdAt: daysAgoISO(12), completedAt: daysAgoISO(12, 7), estimatedMinutes: 45 },
  { id: uuidv4(), title: 'Read TypeScript handbook chapter 3', completed: true, priority: 'low', category: 'Learning', createdAt: daysAgoISO(12), completedAt: daysAgoISO(12, 20), estimatedMinutes: 60 },
  { id: uuidv4(), title: 'Set up CI/CD pipeline', completed: true, priority: 'high', category: 'Work', createdAt: daysAgoISO(11), completedAt: daysAgoISO(11, 14), dueDate: daysAgo(10), estimatedMinutes: 120 },
  { id: uuidv4(), title: 'Meal prep for the week', completed: true, priority: 'medium', category: 'Health', createdAt: daysAgoISO(10), completedAt: daysAgoISO(10, 17), estimatedMinutes: 90 },
  { id: uuidv4(), title: 'Write journal entry', completed: true, priority: 'low', category: 'Personal', createdAt: daysAgoISO(10), completedAt: daysAgoISO(10, 21), estimatedMinutes: 15 },
  { id: uuidv4(), title: 'Fix authentication bug', completed: true, priority: 'high', category: 'Work', createdAt: daysAgoISO(9), completedAt: daysAgoISO(9, 16), dueDate: daysAgo(8), estimatedMinutes: 180, actualMinutes: 200 },
  { id: uuidv4(), title: 'Call mom', completed: true, priority: 'medium', category: 'Personal', createdAt: daysAgoISO(8), completedAt: daysAgoISO(8, 19), estimatedMinutes: 30 },
  { id: uuidv4(), title: 'Update resume', completed: true, priority: 'medium', category: 'Career', createdAt: daysAgoISO(7), completedAt: daysAgoISO(7, 13), estimatedMinutes: 60 },
  { id: uuidv4(), title: 'Grocery shopping', completed: true, priority: 'low', category: 'Personal', createdAt: daysAgoISO(6), completedAt: daysAgoISO(6, 11), estimatedMinutes: 45 },
  { id: uuidv4(), title: 'Write unit tests for API module', completed: true, priority: 'high', category: 'Work', createdAt: daysAgoISO(5), completedAt: daysAgoISO(5, 15), estimatedMinutes: 90 },
  { id: uuidv4(), title: 'Meditate 20 minutes', completed: true, priority: 'low', category: 'Health', createdAt: daysAgoISO(4), completedAt: daysAgoISO(4, 8), estimatedMinutes: 20 },
  { id: uuidv4(), title: 'Read Atomic Habits chapter 5', completed: true, priority: 'low', category: 'Learning', createdAt: daysAgoISO(3), completedAt: daysAgoISO(3, 21), estimatedMinutes: 40 },
  { id: uuidv4(), title: 'Design system documentation', completed: false, priority: 'medium', category: 'Work', createdAt: daysAgoISO(3), dueDate: daysAgo(-2), estimatedMinutes: 120 },
  { id: uuidv4(), title: 'Yoga session', completed: false, priority: 'medium', category: 'Health', createdAt: daysAgoISO(2), dueDate: daysAgo(0), estimatedMinutes: 45 },
  { id: uuidv4(), title: 'Code review for teammate PR', completed: false, priority: 'high', category: 'Work', createdAt: daysAgoISO(2), dueDate: daysAgo(0), estimatedMinutes: 60 },
  { id: uuidv4(), title: 'Plan weekend trip', completed: false, priority: 'low', category: 'Personal', createdAt: daysAgoISO(1), dueDate: daysAgo(-5), estimatedMinutes: 30 },
  { id: uuidv4(), title: 'Finish dashboard project', completed: false, priority: 'high', category: 'Work', createdAt: daysAgoISO(1), dueDate: daysAgo(-1), estimatedMinutes: 240 },
  { id: uuidv4(), title: 'Schedule dentist appointment', completed: false, priority: 'low', category: 'Health', createdAt: daysAgoISO(0), estimatedMinutes: 10 },
  { id: uuidv4(), title: 'Buy birthday gift for Alex', completed: false, priority: 'medium', category: 'Personal', createdAt: daysAgoISO(0), dueDate: daysAgo(-3), estimatedMinutes: 30 },
];

const SEED_MOOD: MoodEntry[] = [
  { id: uuidv4(), date: daysAgo(13), mood: 3, energy: 3, sleepHours: 7, activities: ['work', 'reading'], tags: ['average', 'productive'], notes: 'Decent day overall' },
  { id: uuidv4(), date: daysAgo(12), mood: 4, energy: 4, sleepHours: 8, activities: ['running', 'work', 'reading'], tags: ['energetic', 'focused'] },
  { id: uuidv4(), date: daysAgo(11), mood: 4, energy: 5, sleepHours: 8, activities: ['gym', 'work', 'coding'], tags: ['great', 'productive'], notes: 'Very focused day!' },
  { id: uuidv4(), date: daysAgo(10), mood: 3, energy: 3, sleepHours: 6.5, activities: ['work', 'cooking'], tags: ['tired'], notes: 'Could have slept more' },
  { id: uuidv4(), date: daysAgo(9), mood: 2, energy: 2, sleepHours: 5.5, activities: ['work'], tags: ['stressed', 'tired'], notes: 'Tough day, lots of bugs' },
  { id: uuidv4(), date: daysAgo(7), mood: 4, energy: 4, sleepHours: 8.5, activities: ['gym', 'family', 'reading'], tags: ['relaxed', 'happy'] },
  { id: uuidv4(), date: daysAgo(6), mood: 5, energy: 5, sleepHours: 9, activities: ['hiking', 'socializing'], tags: ['great', 'energetic'], notes: 'Amazing weekend!' },
  { id: uuidv4(), date: daysAgo(4), mood: 4, energy: 4, sleepHours: 7.5, activities: ['meditation', 'work', 'yoga'], tags: ['calm', 'focused'] },
  { id: uuidv4(), date: daysAgo(2), mood: 3, energy: 3, sleepHours: 7, activities: ['work', 'tv'], tags: ['average'] },
  { id: uuidv4(), date: daysAgo(0), mood: 4, energy: 4, sleepHours: 7.5, activities: ['coding', 'reading', 'meditation'], tags: ['productive', 'focused'], notes: 'Good focus session today' },
];

const SEED_FITNESS: FitnessEntry[] = [
  { id: uuidv4(), date: daysAgo(13), type: 'Running', duration: 35, calories: 320, intensity: 'medium', notes: '5km morning run' },
  { id: uuidv4(), date: daysAgo(12), type: 'Running', duration: 45, calories: 420, intensity: 'high', notes: '7km personal best!' },
  { id: uuidv4(), date: daysAgo(11), type: 'Weight Training', duration: 60, calories: 280, intensity: 'high' },
  { id: uuidv4(), date: daysAgo(9), type: 'Yoga', duration: 45, calories: 150, intensity: 'low', notes: 'Morning yoga session' },
  { id: uuidv4(), date: daysAgo(7), type: 'Weight Training', duration: 55, calories: 260, intensity: 'high' },
  { id: uuidv4(), date: daysAgo(6), type: 'Hiking', duration: 120, calories: 550, intensity: 'medium', notes: 'Trail hike, beautiful views' },
  { id: uuidv4(), date: daysAgo(4), type: 'Yoga', duration: 30, calories: 100, intensity: 'low' },
  { id: uuidv4(), date: daysAgo(2), type: 'Running', duration: 40, calories: 370, intensity: 'medium', notes: '6km run' },
];

const SEED_SPENDING: SpendingEntry[] = [
  { id: uuidv4(), date: daysAgo(13), amount: 3500, category: 'Income', description: 'Monthly salary', type: 'income' },
  { id: uuidv4(), date: daysAgo(12), amount: 85, category: 'Food', description: 'Grocery shopping', type: 'expense' },
  { id: uuidv4(), date: daysAgo(11), amount: 12.99, category: 'Subscriptions', description: 'Spotify Premium', type: 'expense' },
  { id: uuidv4(), date: daysAgo(10), amount: 45, category: 'Food', description: 'Restaurant dinner', type: 'expense' },
  { id: uuidv4(), date: daysAgo(9), amount: 9.99, category: 'Subscriptions', description: 'Netflix', type: 'expense' },
  { id: uuidv4(), date: daysAgo(8), amount: 120, category: 'Transport', description: 'Monthly transit pass', type: 'expense' },
  { id: uuidv4(), date: daysAgo(7), amount: 35, category: 'Entertainment', description: 'Movie tickets x2', type: 'expense' },
  { id: uuidv4(), date: daysAgo(6), amount: 65, category: 'Food', description: 'Grocery run', type: 'expense' },
  { id: uuidv4(), date: daysAgo(5), amount: 200, category: 'Shopping', description: 'New running shoes', type: 'expense' },
  { id: uuidv4(), date: daysAgo(4), amount: 28, category: 'Food', description: 'Lunch with colleague', type: 'expense' },
  { id: uuidv4(), date: daysAgo(3), amount: 500, category: 'Income', description: 'Freelance project', type: 'income' },
  { id: uuidv4(), date: daysAgo(3), amount: 15, category: 'Books', description: 'Technical book', type: 'expense' },
  { id: uuidv4(), date: daysAgo(2), amount: 42, category: 'Food', description: 'Grocery shopping', type: 'expense' },
  { id: uuidv4(), date: daysAgo(1), amount: 18, category: 'Food', description: 'Coffee & snacks', type: 'expense' },
  { id: uuidv4(), date: daysAgo(0), amount: 14.99, category: 'Subscriptions', description: 'GitHub Copilot', type: 'expense' },
];

const SEED_LEARNING: LearningEntry[] = [
  { id: uuidv4(), date: daysAgo(12), topic: 'TypeScript Generics', source: 'TypeScript Handbook', duration: 60, rating: 5, tags: ['typescript', 'programming'], notes: 'Really clicked today!' },
  { id: uuidv4(), date: daysAgo(10), topic: 'React Performance Optimization', source: 'React Docs', duration: 45, rating: 4, tags: ['react', 'performance'] },
  { id: uuidv4(), date: daysAgo(8), topic: 'Zustand State Management', source: 'YouTube Tutorial', duration: 30, rating: 4, tags: ['react', 'state-management'] },
  { id: uuidv4(), date: daysAgo(5), topic: 'CSS Grid Layout', source: 'css-tricks.com', duration: 40, rating: 3, tags: ['css', 'frontend'] },
  { id: uuidv4(), date: daysAgo(2), topic: 'Docker Fundamentals', source: 'Udemy Course', duration: 90, rating: 5, tags: ['devops', 'docker'], notes: 'Great course structure' },
];

const SEED_READING: ReadingEntry[] = [
  { id: uuidv4(), title: 'Atomic Habits', author: 'James Clear', status: 'reading', startedAt: daysAgo(14), pagesTotal: 320, pagesRead: 180, genre: 'Self-Help', notes: 'Incredibly practical advice' },
  { id: uuidv4(), title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', status: 'completed', startedAt: daysAgo(45), completedAt: daysAgo(10), pagesTotal: 352, pagesRead: 352, rating: 5, genre: 'Technology', notes: 'Must read for every developer' },
  { id: uuidv4(), title: 'Deep Work', author: 'Cal Newport', status: 'want-to-read', pagesTotal: 296, genre: 'Productivity' },
];

const SEED_GOALS: Goal[] = [
  {
    id: uuidv4(),
    title: 'Run a 10K',
    description: 'Build up to running a 10K race',
    category: 'Fitness',
    targetDate: daysAgo(-60),
    progress: 65,
    status: 'active',
    createdAt: daysAgoISO(30),
    milestones: [
      { id: uuidv4(), title: 'Run 2km without stopping', completed: true, completedAt: daysAgoISO(25) },
      { id: uuidv4(), title: 'Run 5km', completed: true, completedAt: daysAgoISO(10) },
      { id: uuidv4(), title: 'Run 7km', completed: false },
      { id: uuidv4(), title: 'Complete 10K race', completed: false },
    ],
  },
  {
    id: uuidv4(),
    title: 'Launch side project',
    description: 'Ship the personal dashboard app',
    category: 'Career',
    targetDate: daysAgo(-14),
    progress: 80,
    status: 'active',
    createdAt: daysAgoISO(20),
    milestones: [
      { id: uuidv4(), title: 'Define requirements', completed: true, completedAt: daysAgoISO(18) },
      { id: uuidv4(), title: 'Set up project structure', completed: true, completedAt: daysAgoISO(15) },
      { id: uuidv4(), title: 'Build core features', completed: true, completedAt: daysAgoISO(5) },
      { id: uuidv4(), title: 'Deploy to production', completed: false },
    ],
  },
  {
    id: uuidv4(),
    title: 'Read 12 books this year',
    description: 'One book per month challenge',
    category: 'Learning',
    targetDate: daysAgo(-180),
    progress: 25,
    status: 'active',
    createdAt: daysAgoISO(60),
    milestones: [
      { id: uuidv4(), title: 'Read 3 books', completed: true, completedAt: daysAgoISO(10) },
      { id: uuidv4(), title: 'Read 6 books', completed: false },
      { id: uuidv4(), title: 'Read 9 books', completed: false },
      { id: uuidv4(), title: 'Read 12 books', completed: false },
    ],
  },
];

interface StoreState {
  tasks: Task[];
  notes: Note[];
  fitnessEntries: FitnessEntry[];
  spendingEntries: SpendingEntry[];
  moodEntries: MoodEntry[];
  learningEntries: LearningEntry[];
  readingEntries: ReadingEntry[];
  goals: Goal[];
  codeCommits: CodeCommit[];
  settings: { darkMode: boolean };

  // Auth / Supabase sync
  userId: string | null;
  setUserId: (id: string | null) => void;
  loadUserData: (userId: string) => Promise<void>;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Fitness
  addFitnessEntry: (entry: Omit<FitnessEntry, 'id'>) => void;
  updateFitnessEntry: (id: string, updates: Partial<FitnessEntry>) => void;
  deleteFitnessEntry: (id: string) => void;

  // Spending
  addSpendingEntry: (entry: Omit<SpendingEntry, 'id'>) => void;
  updateSpendingEntry: (id: string, updates: Partial<SpendingEntry>) => void;
  deleteSpendingEntry: (id: string) => void;

  // Mood
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  updateMoodEntry: (id: string, updates: Partial<MoodEntry>) => void;
  deleteMoodEntry: (id: string) => void;

  // Learning
  addLearningEntry: (entry: Omit<LearningEntry, 'id'>) => void;
  updateLearningEntry: (id: string, updates: Partial<LearningEntry>) => void;
  deleteLearningEntry: (id: string) => void;

  // Reading
  addReadingEntry: (entry: Omit<ReadingEntry, 'id'>) => void;
  updateReadingEntry: (id: string, updates: Partial<ReadingEntry>) => void;
  deleteReadingEntry: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Code Commits
  addCodeCommit: (commit: Omit<CodeCommit, 'id'>) => void;
  deleteCodeCommit: (id: string) => void;

  // Settings
  toggleDarkMode: () => void;

  // Insights
  getInsights: () => string[];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      tasks: SEED_TASKS,
      notes: [],
      fitnessEntries: SEED_FITNESS,
      spendingEntries: SEED_SPENDING,
      moodEntries: SEED_MOOD,
      learningEntries: SEED_LEARNING,
      readingEntries: SEED_READING,
      goals: SEED_GOALS,
      codeCommits: [],
      settings: { darkMode: false },
      userId: null,

      setUserId: (id) => set({ userId: id }),

      loadUserData: async (userId) => {
        set({ userId });
        try {
          const [
            { data: tasks },
            { data: notes },
            { data: fitness },
            { data: spending },
            { data: mood },
            { data: learning },
            { data: reading },
            { data: goals },
          ] = await Promise.all([
            supabase.from('tasks').select('*').eq('user_id', userId),
            supabase.from('notes').select('*').eq('user_id', userId),
            supabase.from('fitness_entries').select('*').eq('user_id', userId),
            supabase.from('spending_entries').select('*').eq('user_id', userId),
            supabase.from('mood_entries').select('*').eq('user_id', userId),
            supabase.from('learning_entries').select('*').eq('user_id', userId),
            supabase.from('reading_entries').select('*').eq('user_id', userId),
            supabase.from('goals').select('*').eq('user_id', userId),
          ]);
          set({
            tasks: tasks ? tasks.map((r) => ({
              id: r.id as string,
              title: r.title as string,
              description: r.description as string | undefined,
              completed: r.completed as boolean,
              priority: r.priority as Task['priority'],
              category: r.category as string,
              createdAt: r.created_at as string,
              completedAt: r.completed_at as string | undefined,
              dueDate: r.due_date as string | undefined,
            })) : get().tasks,
            notes: notes ? notes.map((r) => ({
              id: r.id as string,
              title: r.title as string,
              content: r.content as string,
              tags: (r.tags ?? []) as string[],
              category: r.category as string,
              createdAt: r.created_at as string,
              updatedAt: r.updated_at as string,
            })) : get().notes,
            fitnessEntries: fitness ? fitness.map((r) => ({
              id: r.id as string,
              date: r.date as string,
              type: r.type as string,
              duration: r.duration as number,
              calories: r.calories as number | undefined,
              intensity: r.intensity as FitnessEntry['intensity'],
              notes: r.notes as string | undefined,
            })) : get().fitnessEntries,
            spendingEntries: spending ? spending.map((r) => ({
              id: r.id as string,
              date: r.date as string,
              amount: r.amount as number,
              category: r.category as string,
              description: r.description as string,
              type: r.type as SpendingEntry['type'],
            })) : get().spendingEntries,
            moodEntries: mood ? mood.map((r) => ({
              id: r.id as string,
              date: r.date as string,
              mood: r.mood as MoodEntry['mood'],
              energy: r.energy as MoodEntry['energy'],
              notes: r.notes as string | undefined,
              tags: (r.tags ?? []) as string[],
              sleepHours: r.sleep_hours as number | undefined,
              activities: (r.activities ?? []) as string[],
            })) : get().moodEntries,
            learningEntries: learning ? learning.map((r) => ({
              id: r.id as string,
              date: r.date as string,
              topic: r.topic as string,
              source: r.source as string,
              duration: r.duration as number,
              notes: r.notes as string | undefined,
              rating: r.rating as LearningEntry['rating'],
              tags: (r.tags ?? []) as string[],
            })) : get().learningEntries,
            readingEntries: reading ? reading.map((r) => ({
              id: r.id as string,
              title: r.title as string,
              author: r.author as string,
              status: r.status as ReadingEntry['status'],
              startedAt: r.started_at as string | undefined,
              completedAt: r.completed_at as string | undefined,
              pagesTotal: r.pages_total as number | undefined,
              pagesRead: r.pages_read as number | undefined,
              rating: r.rating as ReadingEntry['rating'],
              genre: r.genre as string,
              notes: r.notes as string | undefined,
            })) : get().readingEntries,
            goals: goals ? goals.map((r) => ({
              id: r.id as string,
              title: r.title as string,
              description: r.description as string | undefined,
              category: r.category as string,
              targetDate: r.target_date as string,
              progress: r.progress as number,
              status: r.status as Goal['status'],
              milestones: (r.milestones ?? []) as Goal['milestones'],
              createdAt: r.created_at as string,
            })) : get().goals,
          });
        } catch (err) {
          console.error('Failed to load user data from Supabase, using local cache:', err);
          // Supabase unavailable – keep localStorage data as fallback
        }
      },

      addTask: (task) => {
        const newTask = { ...task, id: uuidv4(), createdAt: new Date().toISOString() };
        set((s) => ({ tasks: [...s.tasks, newTask] }));
        const { userId } = get();
        if (userId) {
          void supabase.from('tasks').insert({ id: newTask.id, user_id: userId, title: newTask.title, description: newTask.description, completed: newTask.completed, priority: newTask.priority, category: newTask.category, created_at: newTask.createdAt, due_date: newTask.dueDate });
        }
      },
      updateTask: (id, updates) => {
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
        const { userId } = get();
        if (userId) {
          void supabase.from('tasks').update({ title: updates.title, description: updates.description, completed: updates.completed, priority: updates.priority, category: updates.category, completed_at: updates.completedAt, due_date: updates.dueDate }).eq('id', id).eq('user_id', userId);
        }
      },
      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        const { userId } = get();
        if (userId) { void supabase.from('tasks').delete().eq('id', id).eq('user_id', userId); }
      },
      toggleTask: (id) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
              : t
          ),
        }));
        const { userId, tasks } = get();
        if (userId) {
          const t = tasks.find((x) => x.id === id);
          if (t) { void supabase.from('tasks').update({ completed: t.completed, completed_at: t.completedAt ?? null }).eq('id', id).eq('user_id', userId); }
        }
      },

      addNote: (note) => {
        const newNote = { ...note, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        set((s) => ({ notes: [...s.notes, newNote] }));
        const { userId } = get();
        if (userId) {
          void supabase.from('notes').insert({ id: newNote.id, user_id: userId, title: newNote.title, content: newNote.content, tags: newNote.tags, category: newNote.category, created_at: newNote.createdAt, updated_at: newNote.updatedAt });
        }
      },
      updateNote: (id, updates) => {
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        }));
        const { userId } = get();
        if (userId) {
          void supabase.from('notes').update({ title: updates.title, content: updates.content, tags: updates.tags, category: updates.category, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
        }
      },
      deleteNote: (id) => {
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
        const { userId } = get();
        if (userId) { void supabase.from('notes').delete().eq('id', id).eq('user_id', userId); }
      },

      addFitnessEntry: (entry) => {
        const newEntry = { ...entry, id: uuidv4() };
        set((s) => ({ fitnessEntries: [...s.fitnessEntries, newEntry] }));
        const { userId } = get();
        if (userId) {
          void supabase.from('fitness_entries').insert({ id: newEntry.id, user_id: userId, date: newEntry.date, type: newEntry.type, duration: newEntry.duration, calories: newEntry.calories, intensity: newEntry.intensity, notes: newEntry.notes });
        }
      },
      updateFitnessEntry: (id, updates) => {
        set((s) => ({ fitnessEntries: s.fitnessEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
        const { userId } = get();
        if (userId) {
          void supabase.from('fitness_entries').update({ date: updates.date, type: updates.type, duration: updates.duration, calories: updates.calories, intensity: updates.intensity, notes: updates.notes }).eq('id', id).eq('user_id', userId);
        }
      },
      deleteFitnessEntry: (id) => {
        set((s) => ({ fitnessEntries: s.fitnessEntries.filter((e) => e.id !== id) }));
        const { userId } = get();
        if (userId) { void supabase.from('fitness_entries').delete().eq('id', id).eq('user_id', userId); }
      },

      addSpendingEntry: (entry) => {
        const newEntry = { ...entry, id: uuidv4() };
        set((s) => ({ spendingEntries: [...s.spendingEntries, newEntry] }));
        const { userId } = get();
        if (userId) {
          void supabase.from('spending_entries').insert({ id: newEntry.id, user_id: userId, date: newEntry.date, amount: newEntry.amount, category: newEntry.category, description: newEntry.description, type: newEntry.type });
        }
      },
      updateSpendingEntry: (id, updates) => {
        set((s) => ({ spendingEntries: s.spendingEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
        const { userId } = get();
        if (userId) {
          void supabase.from('spending_entries').update({ date: updates.date, amount: updates.amount, category: updates.category, description: updates.description, type: updates.type }).eq('id', id).eq('user_id', userId);
        }
      },
      deleteSpendingEntry: (id) => {
        set((s) => ({ spendingEntries: s.spendingEntries.filter((e) => e.id !== id) }));
        const { userId } = get();
        if (userId) { void supabase.from('spending_entries').delete().eq('id', id).eq('user_id', userId); }
      },

      addMoodEntry: (entry) => {
        const newEntry = { ...entry, id: uuidv4() };
        set((s) => ({ moodEntries: [...s.moodEntries, newEntry] }));
        const { userId } = get();
        if (userId) {
          void supabase.from('mood_entries').insert({ id: newEntry.id, user_id: userId, date: newEntry.date, mood: newEntry.mood, energy: newEntry.energy, notes: newEntry.notes, sleep_hours: newEntry.sleepHours, activities: newEntry.activities, tags: newEntry.tags });
        }
      },
      updateMoodEntry: (id, updates) => {
        set((s) => ({ moodEntries: s.moodEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
        const { userId } = get();
        if (userId) {
          void supabase.from('mood_entries').update({ date: updates.date, mood: updates.mood, energy: updates.energy, notes: updates.notes, sleep_hours: updates.sleepHours, activities: updates.activities, tags: updates.tags }).eq('id', id).eq('user_id', userId);
        }
      },
      deleteMoodEntry: (id) => {
        set((s) => ({ moodEntries: s.moodEntries.filter((e) => e.id !== id) }));
        const { userId } = get();
        if (userId) { void supabase.from('mood_entries').delete().eq('id', id).eq('user_id', userId); }
      },

      addLearningEntry: (entry) => {
        const newEntry = { ...entry, id: uuidv4() };
        set((s) => ({ learningEntries: [...s.learningEntries, newEntry] }));
        const { userId } = get();
        if (userId) {
          void supabase.from('learning_entries').insert({ id: newEntry.id, user_id: userId, date: newEntry.date, topic: newEntry.topic, source: newEntry.source, duration: newEntry.duration, rating: newEntry.rating, notes: newEntry.notes, tags: newEntry.tags });
        }
      },
      updateLearningEntry: (id, updates) => {
        set((s) => ({ learningEntries: s.learningEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
        const { userId } = get();
        if (userId) {
          void supabase.from('learning_entries').update({ date: updates.date, topic: updates.topic, source: updates.source, duration: updates.duration, rating: updates.rating, notes: updates.notes, tags: updates.tags }).eq('id', id).eq('user_id', userId);
        }
      },
      deleteLearningEntry: (id) => {
        set((s) => ({ learningEntries: s.learningEntries.filter((e) => e.id !== id) }));
        const { userId } = get();
        if (userId) { void supabase.from('learning_entries').delete().eq('id', id).eq('user_id', userId); }
      },

      addReadingEntry: (entry) => {
        const newEntry = { ...entry, id: uuidv4() };
        set((s) => ({ readingEntries: [...s.readingEntries, newEntry] }));
        const { userId } = get();
        if (userId) {
          void supabase.from('reading_entries').insert({ id: newEntry.id, user_id: userId, title: newEntry.title, author: newEntry.author, status: newEntry.status, pages_total: newEntry.pagesTotal, pages_read: newEntry.pagesRead, rating: newEntry.rating, genre: newEntry.genre, notes: newEntry.notes, started_at: newEntry.startedAt, completed_at: newEntry.completedAt });
        }
      },
      updateReadingEntry: (id, updates) => {
        set((s) => ({ readingEntries: s.readingEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
        const { userId } = get();
        if (userId) {
          void supabase.from('reading_entries').update({ title: updates.title, author: updates.author, status: updates.status, pages_total: updates.pagesTotal, pages_read: updates.pagesRead, rating: updates.rating, genre: updates.genre, notes: updates.notes, started_at: updates.startedAt, completed_at: updates.completedAt }).eq('id', id).eq('user_id', userId);
        }
      },
      deleteReadingEntry: (id) => {
        set((s) => ({ readingEntries: s.readingEntries.filter((e) => e.id !== id) }));
        const { userId } = get();
        if (userId) { void supabase.from('reading_entries').delete().eq('id', id).eq('user_id', userId); }
      },

      addGoal: (goal) => {
        const newGoal = { ...goal, id: uuidv4(), createdAt: new Date().toISOString() };
        set((s) => ({ goals: [...s.goals, newGoal] }));
        const { userId } = get();
        if (userId) {
          void supabase.from('goals').insert({ id: newGoal.id, user_id: userId, title: newGoal.title, description: newGoal.description, category: newGoal.category, target_date: newGoal.targetDate, progress: newGoal.progress, status: newGoal.status, milestones: newGoal.milestones, created_at: newGoal.createdAt });
        }
      },
      updateGoal: (id, updates) => {
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) }));
        const { userId } = get();
        if (userId) {
          void supabase.from('goals').update({ title: updates.title, description: updates.description, category: updates.category, target_date: updates.targetDate, progress: updates.progress, status: updates.status, milestones: updates.milestones }).eq('id', id).eq('user_id', userId);
        }
      },
      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
        const { userId } = get();
        if (userId) { void supabase.from('goals').delete().eq('id', id).eq('user_id', userId); }
      },

      addCodeCommit: (commit) =>
        set((s) => ({ codeCommits: [...s.codeCommits, { ...commit, id: uuidv4() }] })),
      deleteCodeCommit: (id) =>
        set((s) => ({ codeCommits: s.codeCommits.filter((c) => c.id !== id) })),

      toggleDarkMode: () =>
        set((s) => ({ settings: { ...s.settings, darkMode: !s.settings.darkMode } })),

      getInsights: () => {
        const { tasks, moodEntries, fitnessEntries } = get();
        return generateInsightSummary({ tasks, mood: moodEntries, fitness: fitnessEntries });
      },
    }),
    {
      name: 'pid-storage',
    }
  )
);
