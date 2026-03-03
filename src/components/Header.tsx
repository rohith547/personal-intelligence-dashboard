import { useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';

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
  const navigate = useNavigate();
  const { toggleDarkMode, settings } = useStore((s) => ({
    toggleDarkMode: s.toggleDarkMode,
    settings: s.settings,
  }));
  const { user, signOut } = useAuth();
  const title = pageTitles[location.pathname] ?? 'Dashboard';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    '';

  const initials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {user && (
          <>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold"
                title={user.email ?? ''}
              >
                {initials}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                {displayName}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={20} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
