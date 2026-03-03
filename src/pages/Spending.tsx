import { useState, useMemo } from 'react';
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import { useStore } from '../store/useStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Subscriptions', 'Books', 'Other'];
const COLORS = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#eab308', '#06b6d4', '#64748b'];

export default function Spending() {
  const { spendingEntries, addSpendingEntry, deleteSpendingEntry } = useStore((s) => ({
    spendingEntries: s.spendingEntries,
    addSpendingEntry: s.addSpendingEntry,
    deleteSpendingEntry: s.deleteSpendingEntry,
  }));

  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Food',
    description: '',
    type: 'expense' as 'expense' | 'income',
  });

  const sorted = [...spendingEntries]
    .filter((e) => typeFilter === 'all' || e.type === typeFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalIncome = spendingEntries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpenses = spendingEntries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    spendingEntries.filter((e) => e.type === 'expense').forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    return Object.entries(catMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [spendingEntries]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expenses: number }> = {};
    spendingEntries.forEach((e) => {
      const key = e.date.slice(0, 7);
      if (!months[key]) months[key] = { income: 0, expenses: 0 };
      if (e.type === 'income') months[key].income += e.amount;
      else months[key].expenses += e.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({ month: month.slice(5), ...data }));
  }, [spendingEntries]);

  const handleAdd = () => {
    if (!form.amount || !form.description.trim()) return;
    addSpendingEntry({
      date: form.date,
      amount: Number(form.amount),
      category: form.type === 'income' ? 'Income' : form.category,
      description: form.description.trim(),
      type: form.type,
    });
    setForm({ date: new Date().toISOString().split('T')[0], amount: '', category: 'Food', description: '', type: 'expense' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-500">${totalIncome.toFixed(0)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
            <TrendingUp size={12} /> Income
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-500">${totalExpenses.toFixed(0)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
            <TrendingDown size={12} /> Expenses
          </div>
        </Card>
        <Card className="text-center">
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary-500' : 'text-red-500'}`}>
            ${balance.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Balance</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Donut */}
        <Card title="Spending by Category">
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1 min-w-0">
                {categoryData.slice(0, 6).map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{c.name}</span>
                    <span className="text-gray-500 shrink-0">${c.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No expense data</p>
          )}
        </Card>

        {/* Monthly Bar */}
        <Card title="Monthly Overview">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(0)}`} />
                <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No data</p>
          )}
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(['all', 'expense', 'income'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-4 py-2 text-sm font-medium capitalize ${typeFilter === f ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {showForm && (
        <Card title="New Transaction">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'expense' | 'income' })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="number"
              placeholder="Amount *"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {form.type === 'expense' && (
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <input
              type="text"
              placeholder="Description *"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="sm:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <div className="sm:col-span-2 flex gap-3">
              <button onClick={handleAdd} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
              <button onClick={() => setShowForm(false)} className="border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300">Cancel</button>
            </div>
          </div>
        </Card>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon={<DollarSign size={48} />} title="No transactions" description="Start tracking your spending and income." />
      ) : (
        <div className="space-y-2">
          {sorted.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className={`w-2 h-10 rounded-full shrink-0 ${entry.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.description}</span>
                  <Badge variant={entry.type === 'income' ? 'success' : 'danger'}>{entry.type}</Badge>
                  <Badge variant="default">{entry.category}</Badge>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{entry.date}</div>
              </div>
              <div className={`text-sm font-semibold ${entry.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                {entry.type === 'income' ? '+' : '-'}${entry.amount.toFixed(2)}
              </div>
              <button onClick={() => deleteSpendingEntry(entry.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
