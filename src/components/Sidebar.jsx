import React from 'react';
import { 
  Clock, 
  History, 
  BarChart3, 
  Layers, 
  FileSpreadsheet, 
  Users, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  UserCheck,
  X
} from 'lucide-react';

export function Sidebar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onLogout,
  mobileOpen,
  setMobileOpen
}) {
  const isAdmin = currentUser?.role === 'admin';

  const employeeMenuItems = [
    {
      id: 'employee_input',
      label: 'Input Timesheet',
      icon: Clock,
      description: 'Isi kehadiran harian',
    },
    {
      id: 'employee_history',
      label: 'Riwayat Timesheet',
      icon: History,
      description: 'Daftar entri kerja',
    },
    {
      id: 'employee_recap',
      label: 'Rekap Jam Kerja Saya',
      icon: BarChart3,
      description: 'Akumulasi bulanan',
    },
  ];

  const adminMenuItems = [
    {
      id: 'admin_dashboard',
      label: 'Monitoring Timesheet',
      icon: Layers,
      description: 'Dashboard & filter data',
    },
    {
      id: 'admin_recap',
      label: 'Rekap Jam Kerja',
      icon: FileSpreadsheet,
      description: 'Laporan tim & divisi',
    },
    {
      id: 'admin_employees',
      label: 'Data Karyawan',
      icon: Users,
      description: 'Kelola data & akses staf',
    },
    {
      id: 'admin_settings',
      label: 'Pengaturan Sistem',
      icon: Settings,
      description: 'Parameter jam kerja',
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container (Deep Corporate Navy Theme) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-[#16304f] to-[#101c2e] border-r border-white/5 flex flex-col transition-transform duration-300 ease-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print text-slate-200`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* White pill for logo so it looks crisp and perfectly contrasted */}
            <div className="h-10 px-2 py-1 bg-white rounded-xl flex items-center shadow-sm">
              <img 
                src="/logopt.png" 
                alt="PT Suluh Ardhi Engineering" 
                className="h-7 w-auto max-w-[130px] object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='130' height='36' viewBox='0 0 130 36'%3E%3Crect width='130' height='36' fill='%231B365D' rx='4'/%3E%3Ctext x='10' y='23' fill='%23ffffff' font-family='sans-serif' font-size='11' font-weight='bold'%3ESULUH ARDHI%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white tracking-tight leading-tight">
                Suluh Ardhi
              </div>
              <div className="text-[11px] text-sky-200/80 font-medium leading-tight">
                Timesheet System
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="px-3.5 py-3 mx-3 mt-3 rounded-2xl bg-white/6 border border-white/8">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-semibold text-xs shrink-0 ${
              isAdmin ? 'bg-amber-400/90 text-slate-950' : 'bg-sky-500 text-white'
            }`}>
              {currentUser?.namaLengkap?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.namaLengkap}
              </div>
              <div className="text-[11px] text-slate-300/90 truncate">
                {currentUser?.posisi}
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/8 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Status akses</span>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 font-medium text-amber-200 bg-amber-400/12 px-2 py-0.5 rounded-full text-[10px] border border-amber-300/20">
                <ShieldCheck className="w-3 h-3 text-amber-300" /> Admin HR
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium text-sky-100 bg-sky-400/12 px-2 py-0.5 rounded-full text-[10px] border border-sky-300/20">
                <UserCheck className="w-3 h-3 text-sky-300" /> Karyawan
              </span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-4 flex-1 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-medium text-slate-400">
            Menu utama
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left cursor-pointer group ${
                  isActive
                    ? 'bg-white/12 text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                    : 'text-slate-300 hover:bg-white/6 hover:text-white font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-sky-300' : 'text-slate-400 group-hover:text-sky-300'
                }`} />
                <div className="overflow-hidden flex-1">
                  <div className="text-xs leading-snug truncate">
                    {item.label}
                  </div>
                  <div className={`text-[10px] leading-tight truncate ${
                    isActive ? 'text-sky-100/80' : 'text-slate-400'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Actions: Logout */}
        <div className="p-3 border-t border-white/8 bg-black/15">
          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-200 hover:bg-rose-950/30 text-xs font-semibold cursor-pointer transition border border-transparent hover:border-rose-900/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
}
