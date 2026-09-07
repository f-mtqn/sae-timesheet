import React from 'react';
import { 
  Clock, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  UserCheck, 
  ShieldCheck, 
  ArrowLeftRight,
  Calendar,
  Layers
} from 'lucide-react';

export function Header({ currentUser, onSwitchRole, onLogout, activeTab, setActiveTab }) {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      {/* Top Bar with Demo Switcher Notice */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-600 text-white">
            Demo Mode
          </span>
          <span>
            Saat ini Anda masuk sebagai: <strong className="text-white font-medium">{currentUser.namaLengkap}</strong> ({isAdmin ? 'Administrator' : 'Karyawan'})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchRole}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white transition font-medium text-xs border border-slate-700 cursor-pointer"
            title="Ganti ke role lain untuk melihat tampilan"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
            Beralih ke {isAdmin ? 'Tampilan Karyawan' : 'Tampilan Admin'}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 flex items-center">
              <img 
                src="/logopt.png" 
                alt="Logo PT Suluh Ardhi Engineering" 
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='36' viewBox='0 0 120 36'%3E%3Crect width='120' height='36' fill='%231B365D' rx='4'/%3E%3Ctext x='10' y='23' fill='%23ffffff' font-family='sans-serif' font-size='12' font-weight='bold'%3ESULUH ARDHI%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <h1 className="text-sm font-bold tracking-tight text-[#1B365D] uppercase">
                PT Suluh Ardhi Engineering
              </h1>
              <p className="text-[11px] text-slate-500">
                Sistem Presensi & Timesheet Karyawan
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('admin_dashboard')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'admin_dashboard'
                      ? 'bg-blue-50 text-[#1B365D] font-semibold border-b-2 border-[#1B365D]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4 text-[#1B365D]" />
                  Monitoring Timesheet
                </button>
                <button
                  onClick={() => setActiveTab('admin_recap')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'admin_recap'
                      ? 'bg-blue-50 text-[#1B365D] font-semibold border-b-2 border-[#1B365D]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#1B365D]" />
                  Rekap Jam Kerja
                </button>
                <button
                  onClick={() => setActiveTab('admin_employees')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'admin_employees'
                      ? 'bg-blue-50 text-[#1B365D] font-semibold border-b-2 border-[#1B365D]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#1B365D]" />
                  Data Karyawan
                </button>
                <button
                  onClick={() => setActiveTab('admin_settings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'admin_settings'
                      ? 'bg-blue-50 text-[#1B365D] font-semibold border-b-2 border-[#1B365D]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-4 h-4 text-[#1B365D]" />
                  Pengaturan
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('employee_input')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'employee_input'
                      ? 'bg-blue-50 text-[#1B365D] font-semibold border-b-2 border-[#1B365D]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4 text-[#1B365D]" />
                  Isi Timesheet Harian
                </button>
                <button
                  onClick={() => setActiveTab('employee_history')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'employee_history'
                      ? 'bg-blue-50 text-[#1B365D] font-semibold border-b-2 border-[#1B365D]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-[#1B365D]" />
                  Riwayat & Rekap Saya
                </button>
              </>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 flex items-center justify-end gap-1.5">
                {isAdmin ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    <ShieldCheck className="w-3 h-3 mr-0.5" /> ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    <UserCheck className="w-3 h-3 mr-0.5" /> KARYAWAN
                  </span>
                )}
                {currentUser.namaLengkap}
              </div>
              <div className="text-xs text-slate-500">
                {currentUser.posisi} • {currentUser.departemen}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition cursor-pointer"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab('admin_dashboard')}
                className={`px-3 py-1.5 rounded text-xs font-medium shrink-0 ${activeTab === 'admin_dashboard' ? 'bg-[#1B365D] text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Monitoring
              </button>
              <button
                onClick={() => setActiveTab('admin_recap')}
                className={`px-3 py-1.5 rounded text-xs font-medium shrink-0 ${activeTab === 'admin_recap' ? 'bg-[#1B365D] text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Rekap
              </button>
              <button
                onClick={() => setActiveTab('admin_employees')}
                className={`px-3 py-1.5 rounded text-xs font-medium shrink-0 ${activeTab === 'admin_employees' ? 'bg-[#1B365D] text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Karyawan
              </button>
              <button
                onClick={() => setActiveTab('admin_settings')}
                className={`px-3 py-1.5 rounded text-xs font-medium shrink-0 ${activeTab === 'admin_settings' ? 'bg-[#1B365D] text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Pengaturan
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('employee_input')}
                className={`px-3 py-1.5 rounded text-xs font-medium shrink-0 ${activeTab === 'employee_input' ? 'bg-[#1B365D] text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Isi Timesheet
              </button>
              <button
                onClick={() => setActiveTab('employee_history')}
                className={`px-3 py-1.5 rounded text-xs font-medium shrink-0 ${activeTab === 'employee_history' ? 'bg-[#1B365D] text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Riwayat Saya
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
