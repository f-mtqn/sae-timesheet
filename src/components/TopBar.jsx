import React from 'react';
import { Menu, Calendar, ShieldCheck, UserCheck, ArrowLeftRight } from 'lucide-react';
import { AccessibilityWidget } from './AccessibilityWidget';

export function TopBar({ currentUser, activeTab, onSwitchRole, onToggleMobileMenu }) {
  const isAdmin = currentUser?.role === 'admin';

  const tabTitles = {
    employee_input: 'Input Timesheet Harian',
    employee_history: 'Riwayat Timesheet Saya',
    employee_recap: 'Rekap Jam Kerja Saya',
    admin_dashboard: 'Monitoring Presensi & Timesheet',
    admin_recap: 'Rekapitulasi Jam Kerja Tim',
    admin_employees: 'Manajemen Data Karyawan',
    admin_settings: 'Pengaturan Jam Kerja & Parameter',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/75 backdrop-blur-md border-b border-slate-200/50 px-4 sm:px-6 py-3.5 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        {/* Mobile menu hamburger */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="text-[11px] font-medium text-slate-400">
            {isAdmin ? 'Portal admin' : 'Portal karyawan'}
          </div>
          <h1 className="text-base sm:text-lg font-semibold text-[#1B365D] leading-snug">
            {tabTitles[activeTab] || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Accessibility Font Size Resizer */}
        <AccessibilityWidget inline={true} tone="light" />

        {/* Today Date Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 text-slate-600 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Senin, 7 September 2026</span>
        </div>

        {/* Demo Switcher Quick Pill */}
        <button
          onClick={onSwitchRole}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#1B365D]/90 hover:bg-[#1B365D] text-white text-xs font-medium cursor-pointer"
          title="Klik untuk beralih mode admin / karyawan"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-sky-200" />
          <span className="hidden sm:inline">Mode:</span>
          <span className="text-sky-100 font-semibold">
            {isAdmin ? 'Admin' : 'Karyawan'}
          </span>
        </button>
      </div>
    </header>
  );
}
