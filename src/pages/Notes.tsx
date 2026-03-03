import { useState } from 'react';
import { Plus, Trash2, FileText, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const CATEGORIES = ['Personal', 'Work', 'Learning', 'Ideas', 'Projects', 'Other'];

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useStore((s) => ({
    notes: s.notes,
    addNote: s.addNote,
    updateNote: s.updateNote,
    deleteNote: s.deleteNote,
  }));

  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'Personal', tags: '' });

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const editing = selectedNote ? notes.find((n) => n.id === selectedNote) : null;

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addNote({
      title: form.title.trim(),
      content: form.content,
      category: form.category,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setForm({ title: '', content: '', category: 'Personal', tags: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={() => { setShowForm(true); setSelectedNote(null); }}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {showForm && (
        <Card title="New Note">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <textarea
              placeholder="Content..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
            <div className="flex gap-3">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Save</button>
              <button onClick={() => setShowForm(false)} className="border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            </div>
          </div>
        </Card>
      )}

      {/* Editor */}
      {editing && (
        <Card title={editing.title} action={
          <button onClick={() => setSelectedNote(null)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
        }>
          <textarea
            value={editing.content}
            onChange={(e) => updateNote(editing.id, { content: e.target.value })}
            rows={8}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        </Card>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          title="No notes yet"
          description="Create your first note to start capturing ideas."
          action={
            <button onClick={() => setShowForm(true)} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              New Note
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note.id === selectedNote ? null : note.id)}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{note.title}</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all ml-2 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">{note.content || 'No content'}</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="info">{note.category}</Badge>
                {note.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
