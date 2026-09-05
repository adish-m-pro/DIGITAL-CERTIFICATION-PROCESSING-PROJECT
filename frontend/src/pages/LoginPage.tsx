import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Award,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Zap,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get('expired') ? 'Your session has expired. Please sign in again.' : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email or student ID and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);

      const role = res.data.user.role;
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'FACULTY') navigate('/faculty/dashboard');
      else if (role === 'HOD') navigate('/hod/dashboard');
      else if (role === 'OFFICE') navigate('/office/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'STUDENT' | 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN') => {
    switch (role) {
      case 'STUDENT':
        setEmail('student@college.edu');
        setPassword('password123');
        break;
      case 'FACULTY':
        setEmail('faculty@college.edu');
        setPassword('password123');
        break;
      case 'HOD':
        setEmail('hod@college.edu');
        setPassword('password123');
        break;
      case 'OFFICE':
        setEmail('office@college.edu');
        setPassword('password123');
        break;
      case 'ADMIN':
        setEmail('admin@college.edu');
        setPassword('password123');
        break;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-950 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white mt-4 tracking-tight">
            Institutional Sign In
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your student, faculty, or administrative workflow portal
          </p>
        </div>

        {error && (
          <div className="mt-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address or Student ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu or STU2023001"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2 text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 font-bold hover:underline">
              Create Real Account
            </Link>
          </div>
        </form>

        {/* Demo Quick-Fill & 1-Click Login */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            1-Click Instant Demo Login
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Click any persona below to immediately authenticate & enter that role's dashboard:
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {(['STUDENT', 'FACULTY', 'HOD', 'OFFICE', 'ADMIN'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={async () => {
                  fillDemo(role);
                  await switchDemoRole(role);
                  if (role === 'STUDENT') navigate('/student/dashboard');
                  else if (role === 'FACULTY') navigate('/faculty/dashboard');
                  else if (role === 'HOD') navigate('/hod/dashboard');
                  else if (role === 'OFFICE') navigate('/office/dashboard');
                  else if (role === 'ADMIN') navigate('/admin/dashboard');
                }}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white text-[11px] font-bold border border-slate-700 hover:border-brand-400 transition-all shadow-sm active:scale-95"
              >
                {role}
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-left text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Default Demo Credentials:</span>
            <div className="mt-1 font-mono text-slate-300">Email: <span className="text-brand-400">student@college.edu</span></div>
            <div className="font-mono text-slate-300">Password: <span className="text-emerald-400">password123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
