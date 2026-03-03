import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <BrainCircuit className="text-blue-500 mb-3" size={40} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Intelligence Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your personal insight engine</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl border-0 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl border-0 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl border-0 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-medium rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Create Account
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          <span className="px-3 text-xs text-gray-400">or</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 text-gray-700 dark:text-gray-300 font-medium rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-colors"
        >
          {googleLoading && <Loader2 size={18} className="animate-spin" />}
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
