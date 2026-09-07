import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Briefcase,
  Layers,
  Fuel,
  Cpu,
  Zap,
  Mountain,
  ChevronRight,
  Building2,
  Phone,
  Mail,
  MapPin,
  Award,
  FileCheck2,
  ArrowUpRight
} from 'lucide-react';
import { AccessibilityWidget } from '../components/AccessibilityWidget';

export function LandingLoginPage({ onLogin, employees }) {
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

  const scrollToLogin = () => {
    const el = document.getElementById('login-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0E1B2E] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. TOP HEADER / NAV BAR */}
      <header className="sticky top-0 z-40 bg-[#0A1424]/90 backdrop-blur-md border-b border-[#1A2E4B] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3.5">
            <div className="h-10 px-2.5 py-1 bg-white rounded-lg flex items-center shadow-xs">
              <img 
                src="/logopt.png" 
                alt="PT Suluh Ardhi Engineering" 
                className="h-7 sm:h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='130' height='36' viewBox='0 0 130 36'%3E%3Crect width='130' height='36' fill='%231B365D' rx='4'/%3E%3Ctext x='10' y='23' fill='%23ffffff' font-family='sans-serif' font-size='11' font-weight='bold'%3ESULUH ARDHI%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase block">
                BUILD ON SYNERGY
              </span>
              <span className="text-[11px] text-slate-400">
                PT Suluh Ardhi Engineering
              </span>
            </div>
          </div>

          {/* Nav Anchors */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#about" className="hover:text-blue-400 transition">Sekilas SAE</a>
            <a href="#business" className="hover:text-blue-400 transition">Bidang Usaha</a>
            <a href="#services" className="hover:text-blue-400 transition">Layanan EPC</a>
            <a href="#contact" className="hover:text-blue-400 transition">Kontak</a>
          </nav>

          {/* Accessibility Font Resizer & Login CTA */}
          <div className="flex items-center gap-3">
            <AccessibilityWidget inline={true} />
            <button
              onClick={scrollToLogin}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH INTEGRATED DIRECT LOGIN CARD */}
      <section className="relative pt-8 pb-16 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-[#0A1424] via-[#0E1B2E] to-[#12223B]">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Company Showcase */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>Engineering, Procurement & Construction (EPC) Specialist</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              BUILD ON <span className="text-blue-400">SYNERGY</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              <strong>PT. Suluh Ardhi Engineering (SAE)</strong> is <em>Your Ideal Partner</em> to perform and deliver <span className="text-white font-semibold">GOOD</span> product & service, <span className="text-white font-semibold">BETTER</span> EPC Business, and <span className="text-white font-semibold">BEST</span> environment to life.
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              Didirikan sejak 14 Februari 2008 melalui kristalisasi tenaga ahli berpengalaman lebih dari 25 tahun, SAE telah berkontribusi menyukseskan berbagai proyek EPC berskala nasional pada sektor <strong>LNG, Oil & Gas, Petrochemical, Mining, dan Power Plants</strong>.
            </p>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              <div className="p-3 rounded-xl bg-[#172B47]/80 border border-[#26446E]">
                <div className="text-xl sm:text-2xl font-extrabold text-white">25+</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Tahun Pengalaman Tim</div>
              </div>
              <div className="p-3 rounded-xl bg-[#172B47]/80 border border-[#26446E]">
                <div className="text-xl sm:text-2xl font-extrabold text-blue-400">160+</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Karyawan & Staf Ahli</div>
              </div>
              <div className="p-3 rounded-xl bg-[#172B47]/80 border border-[#26446E]">
                <div className="text-xl sm:text-2xl font-extrabold text-amber-400">4+</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Sektor Industri Inti</div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a 
                href="#business" 
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                Pelajari Bidang Usaha SAE <ChevronRight className="w-3.5 h-3.5" />
              </a>
              <a 
                href="#contact" 
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Hubungi Kantor Kami <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Direct Integrated Login Card */}
          <div id="login-section" className="lg:col-span-5">
            {/* QUICK DEMO ACCESS PANEL */}
            <div className="mb-4 bg-[#142640] border border-[#23426D] rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1E395F]">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Akses Cepat Demo Presensi
                  </span>
                </div>
                <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded font-bold">
                  Demo 1-Klik
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-3">
                Pilih peran di bawah untuk langsung mencoba aplikasi tanpa perlu login manual:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Demo Button: Karyawan */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('user')}
                  className="flex items-start gap-2.5 p-2.5 text-left rounded-xl border border-blue-400/40 hover:border-blue-400 bg-blue-900/30 hover:bg-blue-900/50 transition cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 group-hover:scale-105 transition shadow-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] font-bold uppercase text-blue-300">Masuk sebagai</div>
                    <div className="text-xs font-bold text-white truncate">Karyawan (User)</div>
                    <div className="text-[10px] text-slate-300 truncate">Budi Santoso • Drafter</div>
                  </div>
                </button>

                {/* Demo Button: Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="flex items-start gap-2.5 p-2.5 text-left rounded-xl border border-amber-400/40 hover:border-amber-400 bg-amber-950/40 hover:bg-amber-950/60 transition cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-amber-500 text-slate-950 shrink-0 group-hover:scale-105 transition shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] font-bold uppercase text-amber-300">Masuk sebagai</div>
                    <div className="text-xs font-bold text-white truncate">Admin HR & Rekap</div>
                    <div className="text-[10px] text-slate-300 truncate">Rina Kartika • HR Admin</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Standard Login & Register Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-800 border border-slate-200">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 mb-5">
                <button
                  onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                  className={`flex-1 pb-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
                    activeTab === 'login'
                      ? 'border-[#1B365D] text-[#1B365D]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-4 h-4 inline-block mr-1.5" />
                  Masuk Akun
                </button>
                <button
                  onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
                  className={`flex-1 pb-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
                    activeTab === 'register'
                      ? 'border-[#1B365D] text-[#1B365D]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-4 h-4 inline-block mr-1.5" />
                  Daftar Karyawan
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {regSuccessMessage && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{regSuccessMessage}</span>
                </div>
              )}

              {activeTab === 'login' ? (
                <form onSubmit={handleStandardLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Perusahaan
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama.karyawan@suluhardhi.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
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
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/50"
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
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#1B365D] hover:bg-[#142642] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Masuk ke Sistem Timesheet
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Rian Pratama, S.T."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Perusahaan
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="rian.p@suluhardhi.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        No. Telepon / WA
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Departemen
                      </label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Operations">Operations</option>
                        <option value="QA & HSE">QA & HSE</option>
                        <option value="Project Support">Project Support</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Kata Sandi
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    * Akun baru otomatis aktif untuk mengisi form timesheet harian.
                  </p>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Daftar Sekarang
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. BUSINESS FIELDS SECTION (OUR BUSINESS FIELDS) */}
      <section id="business" className="py-16 px-4 sm:px-8 bg-[#0B1626] border-t border-[#192E4C]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Fokus Portofolio Industri
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Our Business Fields
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              SAE memiliki rekam jejak teruji dalam menangani berbagai proyek EPC industri berat dengan mengedepankan presisi engineering, kepatuhan standar internasional, dan keselamatan kerja.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Oil & Gas */}
            <div className="p-6 rounded-2xl bg-[#13233A] border border-[#223E66] hover:border-blue-500 transition group space-y-3">
              <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 w-fit group-hover:scale-110 transition">
                <Fuel className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                Oil & Gas
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pengembangan fasilitas pemrosesan minyak mentah, gas metering station, piping network, dan tangki penyimpanan bertekanan tinggi.
              </p>
            </div>

            {/* Card 2: Petrochemical */}
            <div className="p-6 rounded-2xl bg-[#13233A] border border-[#223E66] hover:border-blue-500 transition group space-y-3">
              <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 w-fit group-hover:scale-110 transition">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                Petrochemical
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Perancangan infrastruktur kimia turunan minyak bumi, utilitas reaktor, flare stack, serta sistem perpipaan korosif.
              </p>
            </div>

            {/* Card 3: Power Plant */}
            <div className="p-6 rounded-2xl bg-[#13233A] border border-[#223E66] hover:border-blue-500 transition group space-y-3">
              <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 w-fit group-hover:scale-110 transition">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                Power Plant
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fasilitas pembangkit listrik dengan teknologi bersih dan ramah lingkungan untuk memenuhi kebutuhan energi industri modern.
              </p>
            </div>

            {/* Card 4: Mining & Minerals */}
            <div className="p-6 rounded-2xl bg-[#13233A] border border-[#223E66] hover:border-blue-500 transition group space-y-3">
              <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 w-fit group-hover:scale-110 transition">
                <Mountain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                Mining & Resources
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Infrastruktur ekstraksi dan pemrosesan mineral tambang, conveyor structural system, dan fasilitas penunjang area yard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CAPABILITIES & SERVICES SECTION */}
      <section id="services" className="py-16 px-4 sm:px-8 bg-[#0E1B2E] border-t border-[#192E4C]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Layanan Terintegrasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Capabilities & Engineering Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dukungan penuh dari fase studi kelayakan awal hingga tahap detail engineering design dan pengawasan konstruksi di lapangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service 1: Planning Phase */}
            <div className="p-6 rounded-2xl bg-[#142640] border border-[#24426A] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">Fase 01</div>
              <h3 className="text-lg font-bold text-white">Planning & FEED Phase</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Feasibility Study (FS), Pre-FS, dan Front End Engineering Design (FEED) yang didukung insinyur senior lintas disiplin.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-[#1E395F]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Plant Layout & Site Evaluation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Process Flow Diagram (PFD)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Capital & Operating Cost Estimation
                </li>
              </ul>
            </div>

            {/* Service 2: Detailed Engineering Design */}
            <div className="p-6 rounded-2xl bg-[#142640] border border-[#24426A] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">Fase 02</div>
              <h3 className="text-lg font-bold text-white">Detailed Engineering (DED)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Perhitungan mekanikal, pemodelan 3D, isometrik piping, kalkulasi struktur baja, dan load flow diagram elektrikal/instrumentasi.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-[#1E395F]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Piping Stress Analysis (Caesar II)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> STAAD Pro Structural Analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Electrical Single Line Diagram & Instrument
                </li>
              </ul>
            </div>

            {/* Service 3: Construction & Site Support */}
            <div className="p-6 rounded-2xl bg-[#142640] border border-[#24426A] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">Fase 03</div>
              <h3 className="text-lg font-bold text-white">Site Support & Quality Assurance</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Supervisi inspeksi mutu di lapangan, koordinasi QA/QC pengelasan pipa, audit K3L/HSE, dan verifikasi as-built drawing.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-[#1E395F]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Visual Inspection & NDT Supervision
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> HSE Induction & Safety Audits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Timesheet & Resource Monitoring
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT AT A GLANCE SECTION */}
      <section id="about" className="py-16 px-4 sm:px-8 bg-[#0A1424] border-t border-[#192E4C]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Sekilas Perusahaan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SAE at a Glance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>PT. Suluh Ardhi Engineering</strong> didirikan pada tanggal <strong>14 Februari 2008</strong> di Jakarta. Berangkat dari gabungan para ahli teknik rancang bangun dan manajemen proyek, SAE terus bertumbuh menjadi konsultan rekayasa terpercaya yang mengutamakan kualitas, ketepatan waktu, dan efisiensi biaya.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Aplikasi Timesheet Karyawan ini merupakan wujud transformasi digital internal perusahaan untuk menjamin transparansi pencatatan jam kerja, kalkulasi keterlambatan & lembur yang adil, serta evaluasi produktivitas seluruh tim teknik di kantor maupun lapangan.
            </p>
            <div className="pt-2">
              <button
                onClick={scrollToLogin}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <span>Masuk ke Sistem Presensi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#13233A] border border-[#223E66] space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E395F]">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Informasi Kantor Pusat
              </h4>
            </div>
            <div className="space-y-2.5 text-slate-300 leading-relaxed">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">CIBIS Eight Suite # 7-02 CIBIS Park</strong>
                  <span>Jl. TB Simatupang No. 2, Jakarta Selatan 12560, INDONESIA</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>+62 21 780 33 39 (Hunting) / Fax: +62 21 780 33 59</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>info@sae-engineering.com • www.sae-engineering.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer id="contact" className="py-8 px-4 sm:px-8 bg-[#070D18] border-t border-slate-900 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-medium text-slate-300">
              &copy; 2026 PT. Suluh Ardhi Engineering. All Rights Reserved.
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sistem Manajemen Presensi & Timesheet Kerja Karyawan
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={scrollToLogin} className="hover:text-blue-400 transition cursor-pointer">
              Portal Login
            </button>
            <span>•</span>
            <a href="https://sae-engineering.com/SAE/" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition">
              Website Resmi SAE
            </a>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800">
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
