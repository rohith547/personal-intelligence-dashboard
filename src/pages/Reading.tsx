import { useState } from 'react';
import { Plus, Trash2, Library, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import type { ReadingEntry } from '../types';

const GENRES = ['Fiction', 'Non-Fiction', 'Technology', 'Self-Help', 'Productivity', 'Science', 'History', 'Biography', 'Other'];
const STATUS_CONFIG: Record<ReadingEntry['status'], { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
  'want-to-read': { label: 'Want to Read', variant: 'default' },
  reading: { label: 'Reading', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  abandoned: { label: 'Abandoned', variant: 'default' },
};

export default function Reading() {
  const { readingEntries, addReadingEntry, updateReadingEntry, deleteReadingEntry } = useStore((s) => ({
    readingEntries: s.readingEntries,
    addReadingEntry: s.addReadingEntry,
    updateReadingEntry: s.updateReadingEntry,
    deleteReadingEntry: s.deleteReadingEntry,
  }));

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: 'Technology',
    status: 'want-to-read' as ReadingEntry['status'],
    pagesTotal: '',
    rating: '' as '' | '1' | '2' | '3' | '4' | '5',
    notes: '',
  });

  const byStatus = (status: ReadingEntry['status']) =>
    readingEntries.filter((b) => b.status === status);

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addReadingEntry({
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre,
      status: form.status,
      pagesTotal: form.pagesTotal ? Number(form.pagesTotal) : undefined,
      pagesRead: 0,
      rating: form.rating ? (Number(form.rating) as 1 | 2 | 3 | 4 | 5) : undefined,
      notes: form.notes || undefined,
      startedAt: form.status === 'reading' || form.status === 'completed'
        ? new Date().toISOString().split('T')[0]
        : undefined,
      completedAt: form.status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
    });
    setForm({ title: '', author: '', genre: 'Technology', status: 'want-to-read', pagesTotal: '', rating: '', notes: '' });
    setShowForm(false);
  };

  const BookCard = ({ book }: { book: ReadingEntry }) => (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">{book.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{book.author}</p>
        </div>
        <button
          onClick={() => deleteReadingEntry(book.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant={STATUS_CONFIG[book.status].variant}>{STATUS_CONFIG[book.status].label}</Badge>
        <Badge variant="default">{book.genre}</Badge>
      </div>
      {book.status === 'reading' && book.pagesTotal && book.pagesRead != null && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{book.pagesRead}/{book.pagesTotal} pages</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (book.pagesRead / book.pagesTotal) * 100)}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={book.pagesTotal}
            value={book.pagesRead}
            onChange={(e) => updateReadingEntry(book.id, { pagesRead: Number(e.target.value) })}
            className="w-full mt-1"
          />
        </div>
      )}
      {book.rating && (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={12} className={i < book.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'} />
          ))}
        </div>
      )}
      {book.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{book.notes}</p>}
    </div>
  );

  const sections: { status: ReadingEntry['status']; label: string }[] = [
    { status: 'reading', label: 'Currently Reading' },
    { status: 'want-to-read', label: 'Want to Read' },
    { status: 'completed', label: 'Completed' },
    { status: 'abandoned', label: 'Abandoned' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {sections.map(({ status, label }) => (
          <Card key={status} className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{byStatus(status).length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Add Book
        </button>
      </div>

      {showForm && (
        <Card title="Add Book">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <input type="text" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ReadingEntry['status'] })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <option value="want-to-read">Want to Read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
            <input type="number" placeholder="Total pages" value={form.pagesTotal} onChange={(e) => setForm({ ...form, pagesTotal: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value as '' | '1' | '2' | '3' | '4' | '5' })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <option value="">No rating</option>
              {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{'★'.repeat(r)}</option>)}
            </select>
            <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2} className="sm:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
            <div className="sm:col-span-2 flex gap-3">
              <button onClick={handleAdd} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
              <button onClick={() => setShowForm(false)} className="border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300">Cancel</button>
            </div>
          </div>
        </Card>
      )}

      {readingEntries.length === 0 ? (
        <EmptyState icon={<Library size={48} />} title="No books yet" description="Start building your reading list." />
      ) : (
        sections.map(({ status, label }) =>
          byStatus(status).length > 0 ? (
            <div key={status}>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">{label} ({byStatus(status).length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {byStatus(status).map((book) => <BookCard key={book.id} book={book} />)}
              </div>
            </div>
          ) : null
        )
      )}
    </div>
  );
}
