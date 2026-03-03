import { useState } from 'react';
import { Plus, Check, Trash2, CheckSquare } from 'lucide-react';
import { useStore } from '../store/useStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import type { Priority } from '../types';

const PRIORITY_VARIANTS: Record<Priority, 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

const CATEGORIES = ['Work', 'Health', 'Learning', 'Personal', 'Career', 'Finance', 'Other'];

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useStore((s) => ({
    tasks: s.tasks,
    addTask: s.addTask,
    toggleTask: s.toggleTask,
    deleteTask: s.deleteTask,
  }));

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    category: 'Work',
    dueDate: '',
    estimatedMinutes: '',
  });

  const filtered = tasks
    .filter((t) => {
      if (filter === 'pending') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .filter((t) => categoryFilter === 'all' || t.category === categoryFilter)
    .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pMap = { high: 0, medium: 1, low: 2 };
      return pMap[a.priority] - pMap[b.priority];
    });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      category: form.category,
      completed: false,
      dueDate: form.dueDate || undefined,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
    });
    setForm({ title: '', description: '', priority: 'medium', category: 'Work', dueDate: '', estimatedMinutes: '' });
    setShowForm(false);
  };

  const categories = [...new Set(tasks.map((t) => t.category))];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as 'all' | Priority)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card title="New Task">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Task title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
            </div>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
            <input
              type="number"
              placeholder="Estimated minutes"
              value={form.estimatedMinutes}
              onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
            <div className="sm:col-span-2 flex gap-3">
              <button
                onClick={handleAdd}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Task List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={48} />}
          title="No tasks found"
          description="Add a new task or change your filters."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Add Task
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border transition-all ${
                task.completed
                  ? 'border-gray-100 dark:border-gray-700 opacity-60'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                }`}
              >
                {task.completed && <Check size={12} />}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    task.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge variant={PRIORITY_VARIANTS[task.priority]}>{task.priority}</Badge>
                  <Badge variant="default">{task.category}</Badge>
                  {task.dueDate && (
                    <span
                      className={`text-xs ${
                        !task.completed && new Date(task.dueDate) < new Date()
                          ? 'text-red-500'
                          : 'text-gray-400'
                      }`}
                    >
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {task.estimatedMinutes && (
                    <span className="text-xs text-gray-400">{task.estimatedMinutes}m est.</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
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
