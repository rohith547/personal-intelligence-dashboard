import { useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
  LineChart, Line,
} from 'recharts';
import { useStore } from '../store/useStore';
import Card from '../components/ui/Card';
import {
  getMostProductiveHours,
  getWeeklyProductivityTrend,
  getSpendingInsights,
  getReadingVelocity,
  getSleepVsProductivity,
  getFocusCorrelations,
} from '../lib/insights';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function Insights() {
  const { tasks, moodEntries, fitnessEntries, spendingEntries, readingEntries, learningEntries, getInsights } =
    useStore((s) => ({
      tasks: s.tasks,
      moodEntries: s.moodEntries,
      fitnessEntries: s.fitnessEntries,
      spendingEntries: s.spendingEntries,
      readingEntries: s.readingEntries,
      learningEntries: s.learningEntries,
      getInsights: s.getInsights,
    }));

  const insights = useMemo(() => getInsights(), [getInsights]);
  const productiveHours = useMemo(() => getMostProductiveHours(tasks), [tasks]);
  const weeklyTrend = useMemo(() => getWeeklyProductivityTrend(tasks), [tasks]);
  const spendingInsights = useMemo(() => getSpendingInsights(spendingEntries), [spendingEntries]);
  const readingVelocity = useMemo(() => getReadingVelocity(readingEntries), [readingEntries]);
  const sleepVsProductivity = useMemo(() => getSleepVsProductivity(moodEntries, tasks), [moodEntries, tasks]);
  const focusCorrelations = useMemo(() => getFocusCorrelations(tasks, moodEntries), [tasks, moodEntries]);

  const topHours = productiveHours
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const radarData = [
    { subject: 'Productivity', A: Math.min(100, tasks.filter((t) => t.completed).length * 5) },
    { subject: 'Mood', A: moodEntries.length > 0 ? (moodEntries.reduce((s, m) => s + m.mood, 0) / moodEntries.length) * 20 : 0 },
    { subject: 'Fitness', A: Math.min(100, fitnessEntries.length * 8) },
    { subject: 'Learning', A: Math.min(100, learningEntries.reduce((s, e) => s + e.duration, 0) / 6) },
    { subject: 'Reading', A: Math.min(100, readingEntries.filter((b) => b.status === 'completed').length * 25) },
  ];

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) =>
    trend === 'up' ? <TrendingUp size={16} className="text-red-500" /> :
    trend === 'down' ? <TrendingDown size={16} className="text-green-500" /> :
    <Minus size={16} className="text-yellow-500" />;

  return (
    <div className="space-y-6">
      {/* Summary Insights */}
      <Card title="AI-Powered Insights" subtitle="Personalized recommendations based on your data">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Life Balance Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Life Balance Score" subtitle="Overview of all tracked dimensions">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <Radar name="Score" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Weekly Productivity Trend">
          {weeklyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-16">Complete tasks to see trends</p>
          )}
        </Card>
      </div>

      {/* Sleep vs Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sleep vs Productivity" subtitle="Hours of sleep vs tasks completed">
          {sleepVsProductivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sleepHours" name="Sleep (h)" tick={{ fontSize: 11 }} label={{ value: 'Sleep (h)', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                <YAxis dataKey="avgTasksCompleted" name="Tasks" tick={{ fontSize: 11 }} />
                <ZAxis range={[60, 60]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={sleepVsProductivity} fill="#a855f7" name="Sleep vs Tasks" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">Need more mood + task data</p>
          )}
        </Card>

        <Card title="Focus Correlations" subtitle="Which habits correlate with productivity">
          {focusCorrelations.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={focusCorrelations.sort((a, b) => b.focusScore - a.focusScore).slice(0, 8)} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="habit" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip />
                <Bar dataKey="focusScore" fill="#22c55e" name="Focus Score" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">Log mood with activities to see correlations</p>
          )}
        </Card>
      </div>

      {/* Peak Productivity Hours */}
      <Card title="Peak Productivity Hours" subtitle="When you complete the most tasks">
        {topHours.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={productiveHours.slice(6, 23)}>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(h) => `${h}:00`} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip labelFormatter={(h) => `${h}:00`} />
              <Bar dataKey="score" fill="#f97316" name="Productivity Score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-12">Complete tasks to see your peak hours</p>
        )}
      </Card>

      {/* Spending & Reading Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Spending Summary">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Top Category</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{spendingInsights.topCategory}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Avg</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">${spendingInsights.weeklyAvg}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Trend</span>
              <TrendIcon trend={spendingInsights.trend} />
            </div>
          </div>
        </Card>
        <Card title="Reading Velocity">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Books/Month</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{readingVelocity.booksPerMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</span>
              <span className="text-sm font-semibold text-yellow-500">{readingVelocity.avgRating > 0 ? `${readingVelocity.avgRating} ★` : '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{readingEntries.filter((b) => b.status === 'completed').length}</span>
            </div>
          </div>
        </Card>
        <Card title="Learning Stats">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Hours</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {Math.round(learningEntries.reduce((s, e) => s + e.duration, 0) / 60 * 10) / 10}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sessions</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{learningEntries.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</span>
              <span className="text-sm font-semibold text-yellow-500">
                {learningEntries.length > 0
                  ? `${(learningEntries.reduce((s, e) => s + e.rating, 0) / learningEntries.length).toFixed(1)} ★`
                  : '—'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
