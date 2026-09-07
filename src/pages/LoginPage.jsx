import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';

export function LoginPage({ onLogin, employees }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('Engineering');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Forgot password modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Quick demo logins
  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      const adminUser = employees.find(e => e.role === 'admin') || {
        id: "EMP-010",
        namaLengkap: "Rina Kartika (HR Admin)",
        email: "admin.hr@suluhardhi.com",
        posisi: "HR & Operational Admin",
        departemen: "Human Resources",
        role: "admin",
      };
      onLogin(adminUser);
    } else {
      const employeeUser = employees.find(e => e.role === 'user' && e.id === 'EMP-001') || employees[0];
      onLogin(employeeUser);
    }
  };

  const handleStandardLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Silakan masukkan email dan kata sandi.');
      return;
    }

    const found = employees.find(emp => emp.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      if (found.status === 'nonaktif') {
        setErrorMessage('Akun ini telah dinonaktifkan oleh administrator.');
        return;
      }
      onLogin(found);
    } else {
      // Default fallback demo login if typed custom
      if (email.includes('admin')) {
        onLogin({
          id: "EMP-010",
          namaLengkap: "Rina Kartika (HR Admin)",
          email: email,
          posisi: "HR Admin",
          departemen: "Human Resources",
          role: "admin"
        });
      } else {
        onLogin({
          id: "EMP-DEMO",
          namaLengkap: email.split('@')[0] || "Karyawan Demo",
          email: email,
          posisi: "Engineer",
          departemen: "Engineering",
          role: "user"
        });
      }
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      alert('Mohon lengkapi data registrasi.');
      return;
    }
    setRegSuccessMessage('Pendaftaran berhasil! Silakan gunakan tombol demo atau login menggunakan email Anda.');
    setTimeout(() => {
      setActiveTab('login');
      setEmail(regEmail);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0F1C30] bg-gradient-to-br from-[#0B1526] via-[#12223B] to-[#08101E] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3.5 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
            <img 
              src="/logopt.png" 
              alt="PT Suluh Ardhi Engineering" 
              className="h-12 sm:h-14 w-auto object-contain mx-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='40' viewBox='0 0 140 40'%3E%3Crect width='140' height='40' fill='%231B365D' rx='4'/%3E%3Ctext x='15' y='25' fill='%23ffffff' font-family='sans-serif' font-size='13' font-weight='bold'%3ESULUH ARDHI%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Aplikasi Timesheet Karyawan
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
          PT Suluh Ardhi Engineering — Sistem Pencatatan & Rekap Jam Kerja
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        {/* QUICK DEMO ACCESS PANEL */}
        <div className="mb-5 bg-[#172B47] border border-[#2B4B79] rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#233F67]">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Akses Cepat Demo (Pratinjau Langsung)
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-3.5">
            Pilih salah satu tombol di bawah untuk langsung mencoba aplikasi tanpa perlu mengetik kata sandi:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Demo Button: Karyawan */}
            <button
              type="button"
              onClick={() => handleQuickLogin('user')}
              className="flex items-start gap-3 p-3 text-left rounded-xl border border-blue-400/40 hover:border-blue-400 bg-blue-900/40 hover:bg-blue-900/60 transition cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 group-hover:scale-105 transition shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-bold uppercase text-blue-300">Masuk sebagai</div>
                <div className="text-sm font-bold text-white truncate">Karyawan (User)</div>
                <div className="text-[11px] text-slate-300 truncate">Budi Santoso • Drafter</div>
              </div>
            </button>

            {/* Demo Button: Admin */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex items-start gap-3 p-3 text-left rounded-xl border border-amber-400/40 hover:border-amber-400 bg-amber-950/40 hover:bg-amber-950/60 transition cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-amber-500 text-slate-950 shrink-0 group-hover:scale-105 transition shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-bold uppercase text-amber-300">Masuk sebagai</div>
                <div className="text-sm font-bold text-white truncate">Admin (HR & Rekap)</div>
                <div className="text-[11px] text-slate-300 truncate">Rina Kartika • HR Admin</div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Card with Form Login & Register Tabs */}
        <div className="bg-white py-6 px-6 sm:px-8 shadow-md rounded-xl border border-slate-200">
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition ${
                activeTab === 'login'
                  ? 'border-[#1B365D] text-[#1B365D]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <LogIn className="w-4 h-4 inline-block mr-1.5" />
              Masuk Akun
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition ${
                activeTab === 'register'
                  ? 'border-[#1B365D] text-[#1B365D]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4 inline-block mr-1.5" />
              Registrasi Karyawan
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {regSuccessMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2 text-sm text-green-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
              <span>{regSuccessMessage}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Perusahaan
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama.karyawan@suluhardhi.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]" />
                  <span>Ingat saya di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#1B365D] hover:bg-[#142642] text-white font-semibold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Masuk
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Andi Pratama, S.T."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Perusahaan
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="andi.pratama@suluhardhi.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    No. Telepon / WA
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Departemen
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="QA & HSE">QA & HSE</option>
                    <option value="Project Support">Project Support</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                * Akun baru otomatis aktif sebagai role Karyawan dan dapat langsung mengisi timesheet.
              </p>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Daftar Sekarang
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          PT Suluh Ardhi Engineering &copy; 2026. Hak Cipta Dilindungi.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3 text-[#1B365D]">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-base font-bold">Reset Kata Sandi</h3>
            </div>
            
            {forgotSent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">Tautan Terkirim!</p>
                <p className="text-xs text-slate-600 mt-1">
                  Instruksi pemulihan kata sandi telah dikirimkan ke <strong>{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                  className="mt-5 px-4 py-2 bg-[#1B365D] text-white text-xs font-semibold rounded-lg hover:bg-[#142642]"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-600 mb-4">
                  Masukkan email akun perusahaan Anda. Sistem akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama.karyawan@suluhardhi.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (forgotEmail) setForgotSent(true);
                      else alert('Masukkan alamat email.');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#1B365D] hover:bg-[#142642] rounded-lg"
                  >
                    Kirim Tautan Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
