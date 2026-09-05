import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  Award,
  Users,
  User,
  Building,
  GraduationCap,
  FileCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleDemoStart = async (role: 'STUDENT' | 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN') => {
    await switchDemoRole(role);
    if (role === 'STUDENT') navigate('/student/dashboard');
    else if (role === 'FACULTY') navigate('/faculty/dashboard');
    else if (role === 'HOD') navigate('/hod/dashboard');
    else if (role === 'OFFICE') navigate('/office/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
  };

  const documentTypes = [
    { title: 'Bonafide Certificate', desc: 'Instant student bonafide verification for bank loans, visas, and concessions.', days: '1-2 Days', icon: Award, tag: 'Most Requested' },
    { title: 'Official Transcript', desc: 'Consolidated semester marks, credit records, GPA calculation, and Dean seal.', days: '3-4 Days', icon: GraduationCap, tag: 'Official' },
    { title: 'Recommendation Letter', desc: 'Faculty endorsed appraisal letter for research fellowships and graduate admissions.', days: '2-3 Days', icon: FileCheck, tag: 'Academic' },
    { title: 'Course Completion', desc: 'Attestation of complete coursework and laboratory degree requirements.', days: '4-5 Days', icon: CheckCircle2, tag: 'Graduation' },
    { title: 'No Due Certificate', desc: 'Automated multi-department clearance across Library, Labs, and Accounts.', days: '2-3 Days', icon: ShieldCheck, tag: 'Clearance' },
    { title: 'Conduct & Character', desc: 'Disciplinary clearance verifying exemplary student conduct on campus.', days: '1-2 Days', icon: Zap, tag: 'Certification' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-brand-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/30 text-brand-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            University Academic Workflow Automation 2.0
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight">
            Digital Academic Document <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Workflow & Verification System
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate long queues and paper forms. Request, verify, approve, digitally sign, and download official university credentials with tamper-proof cryptographic QR verification.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-brand-600/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              Sign In to Portal
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              Register Real Account
            </Link>
            <Link
              to="/verify"
              className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-base transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Verify Document by QR
            </Link>
          </div>

          {/* Quick Demo Launchpad */}
          <div className="mt-14 max-w-4xl mx-auto p-6 bg-slate-800/60 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-700">
              <div className="text-left">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Instant Demo Persona Launchpad
                </h2>
                <p className="text-xs text-slate-400">
                  Click any role below to immediately enter the system with realistic preloaded data:
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 bg-brand-900/60 text-brand-300 border border-brand-500/30 rounded-lg">
                Zero Configuration Required
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              <button
                onClick={() => handleDemoStart('STUDENT')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-brand-600/30 border border-slate-700 hover:border-brand-500 text-left transition-all group"
              >
                <div className="text-brand-400 font-bold text-xs group-hover:text-brand-300">Student</div>
                <div className="text-[11px] text-slate-300 font-medium">Aditya Verma</div>
                <div className="text-[10px] text-slate-500 mt-1">Request & Download</div>
              </button>

              <button
                onClick={() => handleDemoStart('FACULTY')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-brand-600/30 border border-slate-700 hover:border-brand-500 text-left transition-all group"
              >
                <div className="text-indigo-400 font-bold text-xs group-hover:text-indigo-300">Faculty Advisor</div>
                <div className="text-[11px] text-slate-300 font-medium">Dr. Priya Sharma</div>
                <div className="text-[10px] text-slate-500 mt-1">First Stage Review</div>
              </button>

              <button
                onClick={() => handleDemoStart('HOD')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-brand-600/30 border border-slate-700 hover:border-brand-500 text-left transition-all group"
              >
                <div className="text-purple-400 font-bold text-xs group-hover:text-purple-300">Dept HOD</div>
                <div className="text-[11px] text-slate-300 font-medium">Prof. Rajesh Kumar</div>
                <div className="text-[10px] text-slate-500 mt-1">Department Signoff</div>
              </button>

              <button
                onClick={() => handleDemoStart('OFFICE')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-brand-600/30 border border-slate-700 hover:border-brand-500 text-left transition-all group"
              >
                <div className="text-emerald-400 font-bold text-xs group-hover:text-emerald-300">Academic Office</div>
                <div className="text-[11px] text-slate-300 font-medium">Ms. Eleanor Vance</div>
                <div className="text-[10px] text-slate-500 mt-1">PDF Engine & Seal</div>
              </button>

              <button
                onClick={() => handleDemoStart('ADMIN')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-brand-600/30 border border-slate-700 hover:border-brand-500 text-left transition-all group"
              >
                <div className="text-rose-400 font-bold text-xs group-hover:text-rose-300">Administrator</div>
                <div className="text-[11px] text-slate-300 font-medium">Dr. Arthur Sterling</div>
                <div className="text-[10px] text-slate-500 mt-1">Workflow Builder</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">How CertiFlow Works</h2>
            <p className="mt-3 text-slate-400 text-base">
              A streamlined, fully automated 5-step pipeline from initial request to verified graduation delivery.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { num: '01', title: 'Submit Request', desc: 'Student selects document type, specifies purpose, and uploads prerequisites.' },
              { num: '02', title: 'Advisor Review', desc: 'Assigned Class Advisor verifies student records, CGPA, and course credentials.' },
              { num: '03', title: 'HOD Approval', desc: 'Head of Department conducts department audit and endorses request.' },
              { num: '04', title: 'PDF Generation', desc: 'Academic Office creates official PDF with cryptographic QR verification stamp.' },
              { num: '05', title: 'Download & Verify', desc: 'Student downloads certificate instantly. Anyone can scan the QR code to verify.' }
            ].map((step) => (
              <div key={step.num} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative group hover:border-brand-500/50 transition-all">
                <div className="text-3xl font-black text-brand-500/30 group-hover:text-brand-400 transition-colors">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-white mt-3">{step.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Documents Section */}
      <section id="documents" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">Supported Academic Documents</h2>
            <p className="mt-3 text-slate-400 text-base">
              Fully configurable workflows accommodating all types of collegiate certifications.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTypes.map((doc) => {
              const Icon = doc.icon;
              return (
                <div key={doc.title} className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 hover:border-brand-500/60 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-400/20 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {doc.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-4">{doc.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{doc.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      Turnaround: {doc.days}
                    </span>
                    <span className="text-brand-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Apply Online &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Verification Spotlight */}
      <section id="workflow" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-brand-950 via-slate-900 to-indigo-950 rounded-3xl border border-brand-800/40 p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full">
                Tamper-Proof & Cryptographically Sealed
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4">
                Public QR Code Verification Portal
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                Every generated academic certificate incorporates a high-entropy verification hash and a scannable QR code. Employers, embassies, and partner universities can independently authenticate documents without phone calls or email delays.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Link
                  to="/verify"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
                >
                  Try Verification Demo
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border-4 border-brand-500/30 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="font-extrabold text-base text-slate-900">VERIFIED ACADEMIC CREDENTIAL</div>
              <div className="text-xs text-slate-500 mt-1">National Institute of Advanced Technology</div>
              <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
                <div><span className="font-bold">Doc ID:</span> DOC-2026-894120</div>
                <div><span className="font-bold">Student:</span> Aditya Verma (STU2023001)</div>
                <div><span className="font-bold">Status:</span> <span className="text-emerald-700 font-bold">AUTHENTIC & VALID</span></div>
              </div>
              <div className="text-[11px] text-slate-400">Scanned via Public Verification Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-slate-300">CertiFlow Academic System</span>
            <span>&bull; Built for National Institute of Advanced Technology</span>
          </div>
          <div>&copy; {new Date().getFullYear()} Digital Academic Document Workflow System. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
