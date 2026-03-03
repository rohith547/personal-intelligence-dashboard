import { useState, useMemo } from 'react';
import { Plus, Trash2, BookOpen, Star } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useStore } from '../store/useStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function Learning() {
  const { learningEntries, addLearningEntry, deleteLearningEntry } = useStore((s) => ({
    learningEntries: s.learningEntries,
    addLearningEntry: s.addLearningEntry,
    deleteLearningEntry: s.deleteLearningEntry,
  }));

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    topic: '',
    source: '',
    duration: '',
    rating: 3 as 1 | 2 | 3 | 4 | 5,
    notes: '',
    tags: '',
  });

  const sorted = [...learningEntries].sort((a, b) => b.date.localeCompare(a.date));
  const totalHours = Math.round(learningEntries.reduce((s, e) => s + e.duration, 0) / 60 * 10) / 10;
  const avgRating = learningEntries.length > 0
    ? (learningEntries.reduce((s, e) => s + e.rating, 0) / learningEntries.length).toFixed(1)
    : '—';

  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {};
    learningEntries.forEach((e) => {
      const d = new Date(e.date);
      const start = new Date(d);
      start.setDate(d.getDate() - d.getDay());
      const key = start.toISOString().split('T')[0];
      weeks[key] = (weeks[key] || 0) + e.duration;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, minutes]) => ({ week: week.slice(5), minutes }));
  }, [learningEntries]);

  const topicData = useMemo(() => {
    const tags: Record<string, number> = {};
    learningEntries.forEach((e) => {
      e.tags.forEach((tag) => {
        tags[tag] = (tags[tag] || 0) + e.duration;
      });
    });
    return Object.entries(tags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, minutes]) => ({ name, minutes }));
  }, [learningEntries]);

  const handleAdd = () => {
    if (!form.topic.trim() || !form.duration) return;
    addLearningEntry({
      date: form.date,
      topic: form.topic.trim(),
      source: form.source.trim(),
      duration: Number(form.duration),
      rating: form.rating,
      notes: form.notes || undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setForm({ date: new Date().toISOString().split('T')[0], topic: '', source: '', duration: '', rating: 3, notes: '', tags: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary-500">{learningEntries.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sessions</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-500">{totalHours}h</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Hours</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-500">{avgRating} ★</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Rating</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Weekly Learning Minutes">
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#a855f7" name="Minutes" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
          )}
        </Card>
        <Card title="Time by Topic">
          {topicData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topicData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#0ea5e9" name="Minutes" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
          )}
        </Card>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Log Session
        </button>
      </div>

      {showForm && (
        <Card title="New Learning Session">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300" />
            <input type="text" placeholder="Topic *" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <input type="text" placeholder="Source (book, website...)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <input type="number" placeholder="Duration (minutes) *" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Rating</label>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as const).map((r) => (
                  <button key={r} onClick={() => setForm({ ...form, rating: r })}
                    className={`p-1.5 rounded ${form.rating >= r ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}>
                    <Star size={20} fill={form.rating >= r ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <input type="text" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <input type="text" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <div className="sm:col-span-2 flex gap-3">
              <button onClick={handleAdd} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
              <button onClick={() => setShowForm(false)} className="border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300">Cancel</button>
            </div>
          </div>
        </Card>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon={<BookOpen size={48} />} title="No learning sessions" description="Start logging your learning activities." />
      ) : (
        <div className="space-y-2">
          {sorted.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.topic}</span>
                  <span className="text-yellow-500 text-xs">{'★'.repeat(entry.rating)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span>{entry.date}</span>
                  <span>{entry.duration}min</span>
                  {entry.source && <span>{entry.source}</span>}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.tags.map((tag) => <Badge key={tag} variant="purple">{tag}</Badge>)}
                </div>
              </div>
              <button onClick={() => deleteLearningEntry(entry.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
