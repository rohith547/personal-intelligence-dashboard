import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Fitness from './pages/Fitness';
import Spending from './pages/Spending';
import Mood from './pages/Mood';
import Learning from './pages/Learning';
import Reading from './pages/Reading';
import Goals from './pages/Goals';
import Insights from './pages/Insights';

export default function App() {
  const darkMode = useStore((s) => s.settings.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="notes" element={<Notes />} />
          <Route path="fitness" element={<Fitness />} />
          <Route path="spending" element={<Spending />} />
          <Route path="mood" element={<Mood />} />
          <Route path="learning" element={<Learning />} />
          <Route path="reading" element={<Reading />} />
          <Route path="goals" element={<Goals />} />
          <Route path="insights" element={<Insights />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
