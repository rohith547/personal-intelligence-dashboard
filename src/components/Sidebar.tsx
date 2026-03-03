import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Dumbbell,
  DollarSign,
  Smile,
  BookOpen,
  Library,
  Target,
  Brain,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/notes', label: 'Notes', icon: FileText },
  { to: '/fitness', label: 'Fitness', icon: Dumbbell },
  { to: '/spending', label: 'Spending', icon: DollarSign },
  { to: '/mood', label: 'Mood', icon: Smile },
  { to: '/learning', label: 'Learning', icon: BookOpen },
  { to: '/reading', label: 'Reading', icon: Library },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/insights', label: 'Insights', icon: Brain },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Brain className="text-primary-500" size={24} />
          <span className="font-bold text-gray-900 dark:text-white text-lg">PID</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Personal Intelligence</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-r-2 border-primary-500'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
