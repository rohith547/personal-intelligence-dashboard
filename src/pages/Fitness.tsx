import { useState, useMemo } from 'react';
import { Plus, Trash2, Dumbbell } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useStore } from '../store/useStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const TYPES = ['Running', 'Weight Training', 'Yoga', 'Cycling', 'Swimming', 'Hiking', 'HIIT', 'Other'];

export default function Fitness() {
  const { fitnessEntries, addFitnessEntry, deleteFitnessEntry } = useStore((s) => ({
    fitnessEntries: s.fitnessEntries,
    addFitnessEntry: s.addFitnessEntry,
    deleteFitnessEntry: s.deleteFitnessEntry,
  }));

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Running',
    duration: '',
    calories: '',
    intensity: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
  });

  const sorted = [...fitnessEntries].sort((a, b) => b.date.localeCompare(a.date));

  const weeklyData = useMemo(() => {
    const weeks: Record<string, { duration: number; calories: number; count: number }> = {};
    fitnessEntries.forEach((e) => {
      const d = new Date(e.date);
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      const key = startOfWeek.toISOString().split('T')[0];
      if (!weeks[key]) weeks[key] = { duration: 0, calories: 0, count: 0 };
      weeks[key].duration += e.duration;
      weeks[key].calories += e.calories ?? 0;
      weeks[key].count += 1;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, data]) => ({ week: week.slice(5), ...data }));
  }, [fitnessEntries]);

  const totalDuration = fitnessEntries.reduce((s, e) => s + e.duration, 0);
  const totalCalories = fitnessEntries.reduce((s, e) => s + (e.calories ?? 0), 0);
  const avgDuration =
    fitnessEntries.length > 0 ? Math.round(totalDuration / fitnessEntries.length) : 0;

  const handleAdd = () => {
    if (!form.duration) return;
    addFitnessEntry({
      date: form.date,
      type: form.type,
      duration: Number(form.duration),
      calories: form.calories ? Number(form.calories) : undefined,
      intensity: form.intensity,
      notes: form.notes || undefined,
    });
    setForm({ date: new Date().toISOString().split('T')[0], type: 'Running', duration: '', calories: '', intensity: 'medium', notes: '' });
    setShowForm(false);
  };

  const intensityVariant = (i: string) =>
    i === 'high' ? 'danger' : i === 'medium' ? 'warning' : 'success';

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Workouts', value: fitnessEntries.length },
          { label: 'Total Minutes', value: totalDuration.toLocaleString() },
          { label: 'Avg Duration', value: `${avgDuration}m` },
          { label: 'Calories Burned', value: totalCalories.toLocaleString() },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card title="Weekly Activity" subtitle="Duration (minutes) by week">
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="duration" fill="#0ea5e9" name="Minutes" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
        )}
      </Card>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Log Workout
        </button>
      </div>

      {showForm && (
        <Card title="Log Workout">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="number"
              placeholder="Duration (minutes) *"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="number"
              placeholder="Calories burned (optional)"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={form.intensity}
              onChange={(e) => setForm({ ...form, intensity: e.target.value as 'low' | 'medium' | 'high' })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="low">Low Intensity</option>
              <option value="medium">Medium Intensity</option>
              <option value="high">High Intensity</option>
            </select>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <div className="sm:col-span-2 flex gap-3">
              <button onClick={handleAdd} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Log</button>
              <button onClick={() => setShowForm(false)} className="border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300">Cancel</button>
            </div>
          </div>
        </Card>
      )}

      {/* Entry List */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={48} />}
          title="No workouts logged"
          description="Start tracking your fitness journey."
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center shrink-0">
                <Dumbbell size={18} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{entry.type}</span>
                  <Badge variant={intensityVariant(entry.intensity) as 'danger' | 'warning' | 'success'}>{entry.intensity}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{entry.date}</span>
                  <span>{entry.duration} min</span>
                  {entry.calories && <span>{entry.calories} kcal</span>}
                  {entry.notes && <span className="truncate">{entry.notes}</span>}
                </div>
              </div>
              <button
                onClick={() => deleteFitnessEntry(entry.id)}
                className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
