import { useState } from 'react';
import { Plus, Trash2, Target, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import type { Goal } from '../types';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = ['Fitness', 'Career', 'Learning', 'Finance', 'Health', 'Personal', 'Other'];

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore((s) => ({
    goals: s.goals,
    addGoal: s.addGoal,
    updateGoal: s.updateGoal,
    deleteGoal: s.deleteGoal,
  }));

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Personal',
    targetDate: '',
    status: 'active' as Goal['status'],
    milestones: [''],
  });

  const handleAdd = () => {
    if (!form.title.trim() || !form.targetDate) return;
    addGoal({
      title: form.title.trim(),
      description: form.description || undefined,
      category: form.category,
      targetDate: form.targetDate,
      progress: 0,
      status: form.status,
      milestones: form.milestones
        .filter((m) => m.trim())
        .map((m) => ({ id: uuidv4(), title: m.trim(), completed: false })),
    });
    setForm({ title: '', description: '', category: 'Personal', targetDate: '', status: 'active', milestones: [''] });
    setShowForm(false);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId
        ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
        : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress = updatedMilestones.length > 0
      ? Math.round((completedCount / updatedMilestones.length) * 100)
      : 0;
    updateGoal(goalId, { milestones: updatedMilestones, progress });
  };

  const statusVariant = (s: Goal['status']) =>
    s === 'active' ? 'info' : s === 'completed' ? 'success' : 'warning';

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const pausedGoals = goals.filter((g) => g.status === 'paused');

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const isExpanded = expandedId === goal.id;
    const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center shrink-0">
            <Target size={18} className="text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{goal.title}</h3>
              <Badge variant={statusVariant(goal.status)}>{goal.status}</Badge>
              <Badge variant="default">{goal.category}</Badge>
            </div>
            {goal.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{goal.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
              {daysLeft > 0 ? (
                <span className="text-orange-500">{daysLeft} days left</span>
              ) : (
                <span className="text-red-500">Overdue by {Math.abs(daysLeft)} days</span>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => setExpandedId(isExpanded ? null : goal.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button onClick={() => deleteGoal(goal.id)} className="text-gray-300 hover:text-red-400 p-1">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{goal.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {/* Milestones */}
        {isExpanded && goal.milestones.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Milestones</p>
            {goal.milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleMilestone(goal.id, m.id)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    m.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {m.completed && <Check size={10} />}
                </button>
                <span className={`text-xs ${m.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Status update */}
        {isExpanded && (
          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            {(['active', 'completed', 'paused'] as Goal['status'][]).map((s) => (
              <button
                key={s}
                onClick={() => updateGoal(goal.id, { status: s })}
                className={`text-xs px-3 py-1 rounded-full capitalize border transition-colors ${
                  goal.status === s
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-primary-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary-500">{activeGoals.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active Goals</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-500">{completedGoals.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-500">{pausedGoals.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Paused</div>
        </Card>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> New Goal
        </button>
      </div>

      {showForm && (
        <Card title="New Goal">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Goal title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="sm:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} className="sm:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300" />
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Milestones</p>
              {form.milestones.map((m, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="text" placeholder={`Milestone ${i + 1}`} value={m}
                    onChange={(e) => { const ms = [...form.milestones]; ms[i] = e.target.value; setForm({ ...form, milestones: ms }); }}
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  {form.milestones.length > 1 && (
                    <button onClick={() => setForm({ ...form, milestones: form.milestones.filter((_, j) => j !== i) })}
                      className="text-gray-400 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setForm({ ...form, milestones: [...form.milestones, ''] })}
                className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1">
                <Plus size={12} /> Add milestone
              </button>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button onClick={handleAdd} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Create Goal</button>
              <button onClick={() => setShowForm(false)} className="border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300">Cancel</button>
            </div>
          </div>
        </Card>
      )}

      {goals.length === 0 ? (
        <EmptyState icon={<Target size={48} />} title="No goals yet" description="Set your first goal and start tracking your progress." />
      ) : (
        <div className="space-y-4">
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Active ({activeGoals.length})</h2>
              <div className="space-y-4">{activeGoals.map((g) => <GoalCard key={g.id} goal={g} />)}</div>
            </div>
          )}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Completed ({completedGoals.length})</h2>
              <div className="space-y-4">{completedGoals.map((g) => <GoalCard key={g.id} goal={g} />)}</div>
            </div>
          )}
          {pausedGoals.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Paused ({pausedGoals.length})</h2>
              <div className="space-y-4">{pausedGoals.map((g) => <GoalCard key={g.id} goal={g} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
