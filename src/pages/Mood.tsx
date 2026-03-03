import { useState, useMemo } from 'react';
import { Plus, Trash2, Smile } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useStore } from '../store/useStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import type { MoodLevel, EnergyLevel } from '../types';

const MOOD_LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Great'];
const MOOD_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
const ACTIVITIES = ['meditation', 'running', 'gym', 'reading', 'socializing', 'work', 'family', 'yoga', 'cooking', 'tv', 'hiking', 'coding'];

export default function Mood() {
  const { moodEntries, addMoodEntry, deleteMoodEntry } = useStore((s) => ({
    moodEntries: s.moodEntries,
    addMoodEntry: s.addMoodEntry,
    deleteMoodEntry: s.deleteMoodEntry,
  }));

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 3 as MoodLevel,
    energy: 3 as EnergyLevel,
    sleepHours: '',
    notes: '',
    tags: '',
    activities: [] as string[],
  });

  const sorted = [...moodEntries].sort((a, b) => b.date.localeCompare(a.date));

  const trendData = useMemo(() =>
    [...moodEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map((m) => ({ date: m.date.slice(5), mood: m.mood, energy: m.energy, sleep: m.sleepHours ?? 0 })),
    [moodEntries]
  );

  const avgMood = moodEntries.length > 0 ? (moodEntries.reduce((s, m) => s + m.mood, 0) / moodEntries.length).toFixed(1) : '—';
  const avgEnergy = moodEntries.length > 0 ? (moodEntries.reduce((s, m) => s + m.energy, 0) / moodEntries.length).toFixed(1) : '—';
  const avgSleep = useMemo(() => {
    const withSleep = moodEntries.filter((m) => m.sleepHours != null);
    if (withSleep.length === 0) return '—';
    return (withSleep.reduce((s, m) => s + (m.sleepHours ?? 0), 0) / withSleep.length).toFixed(1);
  }, [moodEntries]);

  const toggleActivity = (act: string) => {
    setForm((f) => ({
      ...f,
      activities: f.activities.includes(act)
        ? f.activities.filter((a) => a !== act)
        : [...f.activities, act],
    }));
  };

  const handleAdd = () => {
    addMoodEntry({
      date: form.date,
      mood: form.mood,
      energy: form.energy,
      sleepHours: form.sleepHours ? Number(form.sleepHours) : undefined,
      notes: form.notes || undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      activities: form.activities,
    });
    setForm({ date: new Date().toISOString().split('T')[0], mood: 3, energy: 3, sleepHours: '', notes: '', tags: '', activities: [] });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-500">{avgMood}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Mood</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-500">{avgEnergy}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Energy</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary-500">{avgSleep}h</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Sleep</div>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card title="Mood & Energy Trend" subtitle="Last 30 days">
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#eab308" strokeWidth={2} dot={false} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#22c55e" strokeWidth={2} dot={false} name="Energy" />
              <Line type="monotone" dataKey="sleep" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Sleep (h)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-12">No mood data yet</p>
        )}
      </Card>

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Log Mood
        </button>
      </div>

      {showForm && (
        <Card title="Log Mood Entry">
          <div className="space-y-4">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mood: <span style={{ color: MOOD_COLORS[form.mood] }}>{MOOD_LABELS[form.mood]}</span>
              </label>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setForm({ ...form, mood: level })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      form.mood === level ? 'border-current text-white' : 'border-gray-200 dark:border-gray-600 text-gray-400'
                    }`}
                    style={form.mood === level ? { backgroundColor: MOOD_COLORS[level], borderColor: MOOD_COLORS[level] } : {}}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Energy: {form.energy}/5</label>
              <input
                type="range"
                min={1}
                max={5}
                value={form.energy}
                onChange={(e) => setForm({ ...form, energy: Number(e.target.value) as EnergyLevel })}
                className="w-full"
              />
            </div>
            <input
              type="number"
              placeholder="Sleep hours (e.g. 7.5)"
              step="0.5"
              value={form.sleepHours}
              onChange={(e) => setForm({ ...form, sleepHours: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activities</label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map((act) => (
                  <button
                    key={act}
                    onClick={() => toggleActivity(act)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.activities.includes(act)
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-300'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
            <div className="flex gap-3">
              <button onClick={handleAdd} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Log</button>
              <button onClick={() => setShowForm(false)} className="border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300">Cancel</button>
            </div>
          </div>
        </Card>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon={<Smile size={48} />} title="No mood entries" description="Start tracking your daily mood and energy levels." />
      ) : (
        <div className="space-y-2">
          {sorted.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: MOOD_COLORS[entry.mood] }}
              >
                {entry.mood}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{MOOD_LABELS[entry.mood]}</span>
                  <Badge variant="default">Energy: {entry.energy}/5</Badge>
                  {entry.sleepHours && <Badge variant="info">{entry.sleepHours}h sleep</Badge>}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.activities.map((a) => (
                    <span key={a} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                </div>
                {entry.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{entry.notes}</p>}
              </div>
              <div className="text-xs text-gray-400 shrink-0">{entry.date}</div>
              <button onClick={() => deleteMoodEntry(entry.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
