import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Award,
  User,
  Mail,
  Lock,
  Building,
  GraduationCap,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<any[]>([]);
  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [currentYear, setCurrentYear] = useState('3');
  const [currentSemester, setCurrentSemester] = useState('5');
  const [phone, setPhone] = useState('');
  const [academicBatch, setAcademicBatch] = useState('2023-2027');
  const [advisorId, setAdvisorId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAcademicMeta();
  }, []);

  const fetchAcademicMeta = async () => {
    try {
      const res = await api.get('/auth/academic-meta');
      setDepartments(res.data);
      if (res.data.length > 0) {
        setDepartmentId(res.data[0].id);
        if (res.data[0].courses && res.data[0].courses.length > 0) {
          setCourseId(res.data[0].courses[0].id);
        }
        if (res.data[0].faculty && res.data[0].faculty.length > 0) {
          setAdvisorId(res.data[0].faculty[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load academic metadata', err);
    }
  };

  const handleDeptChange = (deptId: string) => {
    setDepartmentId(deptId);
    const dept = departments.find((d) => d.id === deptId);
    if (dept?.courses && dept.courses.length > 0) {
      setCourseId(dept.courses[0].id);
    } else {
      setCourseId('');
    }
    if (dept?.faculty && dept.faculty.length > 0) {
      setAdvisorId(dept.faculty[0].id);
    } else {
      setAdvisorId('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        departmentId,
        courseId: role === 'STUDENT' ? courseId : undefined,
        studentIdNumber: role === 'STUDENT' ? studentIdNumber : undefined,
        currentYear: role === 'STUDENT' ? currentYear : undefined,
        currentSemester: role === 'STUDENT' ? currentSemester : undefined,
        academicBatch: role === 'STUDENT' ? academicBatch : undefined,
        phone,
        advisorId: role === 'STUDENT' ? advisorId : undefined,
        designation: role === 'FACULTY' ? designation : undefined,
      };

      const res = await api.post('/auth/register', payload);
      login(res.data.token, res.data.user);

      if (role === 'STUDENT') {
        navigate('/student/dashboard');
      } else {
        navigate('/faculty/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDeptObj = departments.find((d) => d.id === departmentId);

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-2xl w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-4 tracking-tight">
            Create Real Institutional Account
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register with your real college email ID to submit and track official academic certificates
          </p>

          {/* Role Toggle */}
          <div className="mt-6 inline-flex p-1 bg-slate-800 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'STUDENT'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Account
            </button>
            <button
              type="button"
              onClick={() => setRole('FACULTY')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'FACULTY'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Faculty / Advisor
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Real Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com or student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Department & Course Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Department <span className="text-rose-400">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => handleDeptChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                required
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {role === 'STUDENT' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Degree Program / Course <span className="text-rose-400">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  required
                >
                  {selectedDeptObj?.courses?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  )) || <option value="">No courses available</option>}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academic Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Associate Professor / Class Advisor"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            )}
          </div>

          {/* Student Specific Fields */}
          {role === 'STUDENT' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student ID / Roll Number
                  </label>
                  <input
                    type="text"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    placeholder="e.g. 23CSE045 (Auto-generated if empty)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Current Standing
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(e.target.value)}
                      className="px-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                    <select
                      value={currentSemester}
                      onChange={(e) => setCurrentSemester(e.target.value)}
                      className="px-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    >
                      <option value="1">Sem 1</option>
                      <option value="2">Sem 2</option>
                      <option value="3">Sem 3</option>
                      <option value="4">Sem 4</option>
                      <option value="5">Sem 5</option>
                      <option value="6">Sem 6</option>
                      <option value="7">Sem 7</option>
                      <option value="8">Sem 8</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Academic Batch
                  </label>
                  <input
                    type="text"
                    value={academicBatch}
                    onChange={(e) => setAcademicBatch(e.target.value)}
                    placeholder="2023-2027"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assigned Faculty / Class Advisor
                  </label>
                  <select
                    value={advisorId}
                    onChange={(e) => setAdvisorId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Select Advisor (Optional)</option>
                    {selectedDeptObj?.faculty?.map((f: any) => (
                      <option key={f.id} value={f.id}>
                        {f.user?.name} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Contact Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Complete Real Account Registration <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
