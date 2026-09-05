import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { NotificationItem } from '../types';
import {
  GraduationCap,
  Bell,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
  Menu,
  X,
  CheckCheck,
  Award
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Polling for demo reactivity
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const handleRoleChange = async (role: 'STUDENT' | 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN') => {
    await switchDemoRole(role);
    setShowRoleSwitcher(false);
    if (role === 'STUDENT') navigate('/student/dashboard');
    else if (role === 'FACULTY') navigate('/faculty/dashboard');
    else if (role === 'HOD') navigate('/hod/dashboard');
    else if (role === 'OFFICE') navigate('/office/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'FACULTY': return '/faculty/dashboard';
      case 'HOD': return '/hod/dashboard';
      case 'OFFICE': return '/office/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Demo Bar */}
      <div className="bg-gradient-to-r from-brand-700 via-indigo-700 to-purple-800 text-xs px-4 py-1.5 text-slate-100 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-[11px] sm:text-xs">
            Digital Academic Document Workflow System &bull; Live Academic Automation Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[11px] text-indigo-200">Switch Live Demo Role:</span>
          <div className="flex items-center gap-1">
            {(['STUDENT', 'FACULTY', 'HOD', 'OFFICE', 'ADMIN'] as const).map(r => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all ${
                  user?.role === r
                    ? 'bg-white text-indigo-900 shadow-sm font-bold scale-105'
                    : 'bg-indigo-950/40 hover:bg-white/20 text-indigo-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight flex items-center gap-1.5 font-sans">
                CertiFlow <span className="text-[10px] px-1.5 py-0.5 bg-brand-500/20 text-brand-300 font-medium rounded border border-brand-400/30">NIAT</span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                Document Workflow & Verification
              </p>
            </div>
          </Link>

          {/* Center Links (if authenticated) */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
              <Link
                to={getDashboardPath()}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname.includes('/dashboard') ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Dashboard
              </Link>
              {user.role === 'STUDENT' && (
                <>
                  <Link
                    to="/student/request"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    Request Document
                  </Link>
                  <Link
                    to="/student/my-requests"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    My Requests
                  </Link>
                </>
              )}
              {user.role === 'FACULTY' && (
                <Link
                  to="/faculty/dashboard"
                  className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Advisor Reviews
                </Link>
              )}
              {user.role === 'HOD' && (
                <Link
                  to="/hod/dashboard"
                  className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Department Requests
                </Link>
              )}
              {user.role === 'OFFICE' && (
                <Link
                  to="/office/dashboard"
                  className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Processing Queue
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/users"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/workflows"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    Workflows
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    Audit Logs
                  </Link>
                </>
              )}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#documents" className="hover:text-white transition-colors">Supported Documents</a>
              <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
              <Link to="/verify" className="hover:text-brand-400 flex items-center gap-1 transition-colors">
                <ShieldCheck className="w-4 h-4" /> QR Verify
              </Link>
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                          <Bell className="w-4 h-4 text-brand-600" />
                          Notifications ({notifications.length})
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (n.link) navigate(n.link);
                                setShowNotifs(false);
                              }}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.readStatus ? 'bg-indigo-50/40' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-slate-900">{n.title}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Badge */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-white">{user.name}</div>
                    <div className="text-[11px] text-brand-400 font-semibold">{user.role}</div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-600/20 transition-all hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
