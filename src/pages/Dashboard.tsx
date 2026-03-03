import { useMemo } from 'react';
import { CheckSquare, Smile, Dumbbell, DollarSign, Target, Lightbulb } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip,
} from 'recharts';
import { useStore } from '../store/useStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const MOOD_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
const TASK_COLORS = ['#22c55e', '#e5e7eb'];

export default function Dashboard() {
  const { tasks, moodEntries, fitnessEntries, spendingEntries, goals, getInsights } = useStore(
    (s) => ({
      tasks: s.tasks,
      moodEntries: s.moodEntries,
      fitnessEntries: s.fitnessEntries,
      spendingEntries: s.spendingEntries,
      goals: s.goals,
      getInsights: s.getInsights,
    })
  );

  const insights = useMemo(() => getInsights(), [getInsights]);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const taskDonutData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: pendingTasks },
  ];

  const avgMood =
    moodEntries.length > 0
      ? (moodEntries.reduce((s, m) => s + m.mood, 0) / moodEntries.length).toFixed(1)
      : 'N/A';

  const totalCalories = fitnessEntries.reduce((s, e) => s + (e.calories ?? 0), 0);

  const totalExpenses = spendingEntries
    .filter((e) => e.type === 'expense')
    .reduce((s, e) => s + e.amount, 0);

  const activeGoals = goals.filter((g) => g.status === 'active').length;

  const moodTrendData = useMemo(() => {
    return [...moodEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((m) => ({
        date: m.date.slice(5),
        mood: m.mood,
        energy: m.energy,
      }));
  }, [moodEntries]);

  const recentActivity = useMemo(() => {
    const completed = tasks
      .filter((t) => t.completed && t.completedAt)
      .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
      .slice(0, 5);
    return completed;
  }, [tasks]);

  const statCards = [
    {
      label: 'Tasks Completed',
      value: completedTasks,
      sub: `${pendingTasks} pending`,
      icon: CheckSquare,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Avg Mood',
      value: avgMood,
      sub: `${moodEntries.length} entries`,
      icon: Smile,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Calories Burned',
      value: totalCalories.toLocaleString(),
      sub: `${fitnessEntries.length} workouts`,
      icon: Dumbbell,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Total Spent',
      value: `$${totalExpenses.toFixed(0)}`,
      sub: `${spendingEntries.filter((e) => e.type === 'expense').length} transactions`,
      icon: DollarSign,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Active Goals',
      value: activeGoals,
      sub: `${goals.length} total`,
      icon: Target,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-0">
            <div className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
                <Icon className={color} size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{sub}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights */}
        <Card
          title="Today's Insights"
          className="lg:col-span-1"
          action={<Lightbulb size={18} className="text-yellow-500" />}
        >
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </Card>

        {/* Mood Trend */}
        <Card title="Mood & Energy Trend" subtitle="Last 14 days" className="lg:col-span-2">
          {moodTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={moodTrendData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  name="Mood"
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="Energy"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-16">No mood data yet</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Donut */}
        <Card title="Task Overview">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={taskDonutData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                  {taskDonutData.map((_, index) => (
                    <Cell key={index} fill={TASK_COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Completed: {completedTasks}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Pending: {pendingTasks}</span>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {tasks.length > 0
                  ? `${Math.round((completedTasks / tasks.length) * 100)}% completion rate`
                  : 'No tasks yet'}
              </div>
            </div>
          </div>
        </Card>

        {/* Mood Distribution */}
        <Card title="Mood Distribution">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={[1, 2, 3, 4, 5].map((level) => ({
                  name: `Level ${level}`,
                  value: moodEntries.filter((m) => m.mood === level).length,
                }))}
                cx="50%"
                cy="50%"
                outerRadius={65}
                dataKey="value"
                label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
                labelLine={false}
              >
                {MOOD_COLORS.map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activity */}
        <Card title="Recently Completed">
          {recentActivity.length > 0 ? (
            <ul className="space-y-3">
              {recentActivity.map((task) => (
                <li key={task.id} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-green-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="default">{task.category}</Badge>
                      <span className="text-xs text-gray-400">
                        {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No completed tasks yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
