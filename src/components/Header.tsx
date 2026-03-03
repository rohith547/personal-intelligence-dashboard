import { useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/notes': 'Notes',
  '/fitness': 'Fitness',
  '/spending': 'Spending',
  '/mood': 'Mood Tracker',
  '/learning': 'Learning',
  '/reading': 'Reading List',
  '/goals': 'Goals',
  '/insights': 'Insights',
};

export default function Header() {
  const location = useLocation();
  const { toggleDarkMode, settings } = useStore((s) => ({
    toggleDarkMode: s.toggleDarkMode,
    settings: s.settings,
  }));
  const title = pageTitles[location.pathname] ?? 'Dashboard';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
      </div>
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle dark mode"
      >
        {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}
