import React from 'react';
import { 
  Clock, 
  History, 
  BarChart3, 
  Layers, 
  FileSpreadsheet, 
  Users, 
  Settings, 
  ArrowLeftRight, 
  LogOut, 
  ShieldCheck, 
  UserCheck,
  X
} from 'lucide-react';

export function Sidebar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onSwitchRole, 
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0F1C30] border-r border-[#1B2F4E] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print text-slate-200`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E3456] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* White pill for logo so it looks crisp and perfectly contrasted */}
            <div className="h-10 px-2 py-1 bg-white rounded-lg flex items-center shadow-xs">
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
              <div className="text-[12px] font-bold text-white tracking-tight uppercase leading-tight">
                Suluh Ardhi
              </div>
              <div className="text-[10px] text-blue-300 font-medium leading-tight">
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
        <div className="px-3.5 py-3 mx-3 mt-3 rounded-xl bg-[#172B47] border border-[#233F67]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
            }`}>
              {currentUser?.namaLengkap?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.namaLengkap}
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {currentUser?.posisi}
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#233F67] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Status Akses:</span>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded text-[10px] border border-amber-800/60">
                <ShieldCheck className="w-3 h-3 text-amber-400" /> Admin HR
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-blue-200 bg-blue-950/60 px-2 py-0.5 rounded text-[10px] border border-blue-800/60">
                <UserCheck className="w-3 h-3 text-blue-400" /> Karyawan
              </span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-4 flex-1 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition cursor-pointer group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-300'
                }`} />
                <div className="overflow-hidden flex-1">
                  <div className="text-xs leading-snug truncate">
                    {item.label}
                  </div>
                  <div className={`text-[10px] leading-tight truncate ${
                    isActive ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Actions: Demo Switcher & Logout */}
        <div className="p-3 border-t border-[#1E3456] space-y-2 bg-[#0A1424]">
          {/* Demo Role Switcher Button */}
          <button
            onClick={onSwitchRole}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#182C48] hover:bg-[#20395C] text-blue-200 hover:text-white text-xs font-bold border border-[#2B4B79] transition cursor-pointer"
            title="Ganti peran antara Admin dan Karyawan untuk demo"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">
              Beralih ke {isAdmin ? 'Tampilan Karyawan' : 'Tampilan Admin'}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-950/40 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}
