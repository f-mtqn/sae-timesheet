import React, { useState, useEffect, useCallback } from 'react';
import { 
  supabase,
  logoutFromSupabase,
  getEmployeesFromSupabase,
  upsertEmployeeToSupabase,
  toggleEmployeeStatusInSupabase,
  getTimesheetsFromSupabase,
  saveTimesheetToSupabase,
  getSettingsFromSupabase,
  saveSettingsToSupabase,
  mapEmployeeFromDB,
  getLateEntryPermitsFromSupabase,
  grantLateEntryPermitInSupabase,
  completeLateEntryPermitInSupabase,
  revokeLateEntryPermitInSupabase
} from './lib/supabaseClient';
import { initialSettings } from './data/dummyData';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { LandingLoginPage } from './pages/LandingLoginPage';
import { EmployeeInputPage } from './pages/EmployeeInputPage';
import { EmployeeHistoryPage } from './pages/EmployeeHistoryPage';
import { EmployeeRecapPage } from './pages/EmployeeRecapPage';
import { AdminDashboardView } from './pages/AdminDashboardView';
import { AdminRecapView } from './pages/AdminRecapView';
import { AdminEmployeesView } from './pages/AdminEmployeesView';
import { AdminSettingsView } from './pages/AdminSettingsView';
import { Loader2, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#132438] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800/90 rounded-3xl p-7 border border-slate-700 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-base font-bold text-slate-100">Terjadi Kendala Memuat Tampilan</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || "Sistem mendeteksi kesalahan sementara pada komponen antarmuka."}
            </p>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

function MainApp() {
  // Database state
  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [settings, setSettings] = useState(initialSettings);
  const [lateEntryPermits, setLateEntryPermits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth state: currentUser (null = login screen)
  const [currentUser, setCurrentUser] = useState(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState('employee_input');

  // Mobile sidebar open state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 1. Fetch all data from Supabase
  const loadSupabaseData = useCallback(async () => {
    try {
      const [empList, tsList, settingsData, permitList] = await Promise.all([
        getEmployeesFromSupabase().catch(err => { console.error('Emp fetch err:', err); return []; }),
        getTimesheetsFromSupabase().catch(err => { console.error('TS fetch err:', err); return []; }),
        getSettingsFromSupabase().catch(err => { console.error('Settings fetch err:', err); return initialSettings; }),
        getLateEntryPermitsFromSupabase().catch(err => { console.error('Permits fetch err:', err); return []; }),
      ]);

      setEmployees(empList);
      setTimesheets(tsList);
      if (settingsData) setSettings(settingsData);
      setLateEntryPermits(permitList || []);
    } catch (err) {
      console.error('Error loading Supabase data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Initialize Session and Data on mount
  useEffect(() => {
    loadSupabaseData();

    // Check active Supabase auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userEmail = session.user.email?.toLowerCase();
        // Fetch profile
        supabase
          .from('employees')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle()
          .then(({ data: emp }) => {
            if (emp && emp.status !== 'nonaktif') {
              const mapped = mapEmployeeFromDB(emp);
              setCurrentUser(mapped);
              setActiveTab(mapped.role === 'admin' ? 'admin_dashboard' : 'employee_input');
            }
          });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadSupabaseData]);

  // Login handler
  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('employee_input');
    }
    // Refresh timesheets & employees on login
    loadSupabaseData();
  };

  // Logout handler
  const handleLogout = async () => {
    await logoutFromSupabase();
    setCurrentUser(null);
    setMobileSidebarOpen(false);
  };

  // Save timesheet entry to Supabase
  const handleSaveTimesheet = async (entry) => {
    try {
      const saved = await saveTimesheetToSupabase(entry);
      setTimesheets(prev => {
        const index = prev.findIndex(item => item.id === saved.id || (item.employeeId === saved.employeeId && item.date === saved.date));
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = saved;
          return updated;
        } else {
          return [saved, ...prev];
        }
      });
    } catch (err) {
      console.error('Error saving timesheet to Supabase:', err);
      alert('Gagal menyimpan timesheet ke database: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Save / update employee to Supabase
  const handleSaveEmployee = async (empData) => {
    try {
      const saved = await upsertEmployeeToSupabase(empData);
      setEmployees(prev => {
        const index = prev.findIndex(e => e.id === saved.id || e.employeeCode === saved.employeeCode);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = saved;
          return updated;
        } else {
          return [...prev, saved];
        }
      });
    } catch (err) {
      console.error('Error saving employee to Supabase:', err);
      alert('Gagal menyimpan karyawan ke database: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Toggle employee active / inactive in Supabase
  const handleToggleEmployeeStatus = async (empId) => {
    try {
      const targetEmp = employees.find(e => e.id === empId);
      if (!targetEmp) return;
      const updated = await toggleEmployeeStatusInSupabase(empId, targetEmp.status);
      setEmployees(prev => prev.map(e => e.id === empId ? updated : e));
    } catch (err) {
      console.error('Error toggling employee status in Supabase:', err);
      alert('Gagal mengubah status karyawan: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Save settings to Supabase
  const handleSaveSettings = async (newSettings) => {
    try {
      const saved = await saveSettingsToSupabase(newSettings);
      setSettings(saved);
    } catch (err) {
      console.error('Error saving settings to Supabase:', err);
      alert('Gagal menyimpan pengaturan ke database: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Permit Handlers (Izin Susulan)
  const handleGrantPermit = async (permitData) => {
    try {
      const saved = await grantLateEntryPermitInSupabase(permitData);
      setLateEntryPermits(prev => [saved, ...prev]);
      return saved;
    } catch (err) {
      console.error('Error granting permit in App:', err);
      throw err;
    }
  };

  const handleCompletePermit = async (employeeId, date) => {
    try {
      await completeLateEntryPermitInSupabase(employeeId, date);
      setLateEntryPermits(prev => prev.map(p => 
        p.employeeId === employeeId && p.permittedDate === date 
          ? { ...p, status: 'completed' } 
          : p
      ));
    } catch (err) {
      console.error('Error completing permit in App:', err);
    }
  };

  const handleRevokePermit = async (permitId) => {
    try {
      const updated = await revokeLateEntryPermitInSupabase(permitId);
      setLateEntryPermits(prev => prev.map(p => p.id === permitId ? updated : p));
      return updated;
    } catch (err) {
      console.error('Error revoking permit in App:', err);
      throw err;
    }
  };

  // If initial load in progress and no user yet
  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#132438] flex flex-col items-center justify-center text-slate-100 gap-3">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <span className="text-sm font-semibold tracking-wide text-sky-200">
          Menghubungkan ke Supabase Database...
        </span>
      </div>
    );
  }

  // If not logged in, show LandingLoginPage with direct login
  if (!currentUser) {
    return <LandingLoginPage onLogin={handleLogin} employees={employees} />;
  }

  return (
    <div className="min-h-screen bg-transparent flex font-sans text-slate-700 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area (Offset by Sidebar on md screens: md:pl-72) */}
      <div className="flex-1 md:pl-72 flex flex-col min-w-0">
        {/* TopBar */}
        <TopBar
          currentUser={currentUser}
          activeTab={activeTab}
          onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 pb-10">
          {currentUser.role === 'admin' ? (
            <>
              {activeTab === 'admin_dashboard' && (
                <AdminDashboardView
                  timesheets={timesheets}
                  employees={employees}
                  settings={settings}
                />
              )}
              {activeTab === 'admin_recap' && (
                <AdminRecapView
                  timesheets={timesheets}
                  employees={employees}
                />
              )}
              {activeTab === 'admin_employees' && (
                <AdminEmployeesView
                  employees={employees}
                  onSaveEmployee={handleSaveEmployee}
                  onToggleStatus={handleToggleEmployeeStatus}
                  lateEntryPermits={lateEntryPermits}
                  onGrantPermit={handleGrantPermit}
                  onRevokePermit={handleRevokePermit}
                />
              )}
              {activeTab === 'admin_settings' && (
                <AdminSettingsView
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                />
              )}
            </>
          ) : (
            <>
              {/* Separate Views for Employee */}
              {activeTab === 'employee_input' && (
                <EmployeeInputPage
                  currentUser={currentUser}
                  timesheets={timesheets}
                  onSaveTimesheet={handleSaveTimesheet}
                  settings={settings}
                  onNavigateToHistory={() => setActiveTab('employee_history')}
                  lateEntryPermits={lateEntryPermits}
                  onCompletePermit={handleCompletePermit}
                />
              )}
              {activeTab === 'employee_history' && (
                <EmployeeHistoryPage
                  currentUser={currentUser}
                  timesheets={timesheets}
                  onSaveTimesheet={handleSaveTimesheet}
                  settings={settings}
                  onNavigateToInput={() => setActiveTab('employee_input')}
                />
              )}
              {activeTab === 'employee_recap' && (
                <EmployeeRecapPage
                  currentUser={currentUser}
                  timesheets={timesheets}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white/70 backdrop-blur-sm border-t border-slate-200/60 py-4 px-6 text-center text-xs text-slate-500 no-print flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            PT Suluh Ardhi Engineering &copy; 2026. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase Connected
            </span>
            <span className="text-[11px] text-slate-400">
              Versi Produksi 1.0
            </span>
          </div>
        </footer>
      </div>

      {/* Floating Accessibility Controls */}
      <AccessibilityWidget />
    </div>
  );
}
