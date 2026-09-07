import React, { useState, useEffect } from 'react';
import { 
  initialEmployees, 
  initialTimesheets, 
  initialSettings 
} from './data/dummyData';
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

export default function App() {
  // Persistence state with localStorage
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('sae_timesheet_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [timesheets, setTimesheets] = useState(() => {
    const saved = localStorage.getItem('sae_timesheet_data');
    return saved ? JSON.parse(saved) : initialTimesheets;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sae_timesheet_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Auth state: currentUser (null = login screen)
  const [currentUser, setCurrentUser] = useState(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState('employee_input');

  // Mobile sidebar open state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('sae_timesheet_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('sae_timesheet_data', JSON.stringify(timesheets));
  }, [timesheets]);

  useEffect(() => {
    localStorage.setItem('sae_timesheet_settings', JSON.stringify(settings));
  }, [settings]);

  // Login handler
  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('employee_input');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setMobileSidebarOpen(false);
  };

  // Quick switch role for testing demo
  const handleSwitchRole = () => {
    if (currentUser?.role === 'admin') {
      const regularUser = employees.find(e => e.role === 'user') || employees[0];
      setCurrentUser(regularUser);
      setActiveTab('employee_input');
    } else {
      const adminUser = employees.find(e => e.role === 'admin') || {
        id: "EMP-010",
        namaLengkap: "Rina Kartika (HR Admin)",
        email: "admin.hr@suluhardhi.com",
        posisi: "HR & Operational Admin",
        departemen: "Human Resources",
        role: "admin",
      };
      setCurrentUser(adminUser);
      setActiveTab('admin_dashboard');
    }
  };

  // Save timesheet entry (Create or Update)
  const handleSaveTimesheet = (entry) => {
    setTimesheets(prev => {
      const index = prev.findIndex(item => item.id === entry.id || (item.employeeId === entry.employeeId && item.date === entry.date));
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...entry };
        return updated;
      } else {
        return [entry, ...prev];
      }
    });
  };

  // Save / update employee (CRUD)
  const handleSaveEmployee = (empData) => {
    setEmployees(prev => {
      const index = prev.findIndex(e => e.id === empData.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = empData;
        return updated;
      } else {
        return [...prev, empData];
      }
    });
  };

  // Toggle employee active / inactive (Soft Delete as per PRD 6.7)
  const handleToggleEmployeeStatus = (empId) => {
    setEmployees(prev => {
      return prev.map(emp => {
        if (emp.id === empId) {
          const newStatus = emp.status === 'aktif' ? 'nonaktif' : 'aktif';
          return { ...emp, status: newStatus };
        }
        return emp;
      });
    });
  };

  // Save settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
  };

  // Reset dummy data
  const handleResetDummyData = () => {
    if (window.confirm("Kembalikan data ke dummy awal? Semua entri buatan Anda akan direset.")) {
      localStorage.removeItem('sae_timesheet_employees');
      localStorage.removeItem('sae_timesheet_data');
      localStorage.removeItem('sae_timesheet_settings');
      setEmployees(initialEmployees);
      setTimesheets(initialTimesheets);
      setSettings(initialSettings);
      alert("Data berhasil direset ke dummy awal.");
    }
  };

  // If not logged in, show LandingLoginPage with direct login
  if (!currentUser) {
    return <LandingLoginPage onLogin={handleLogin} employees={employees} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex font-sans text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchRole={handleSwitchRole}
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
          onSwitchRole={handleSwitchRole}
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
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            PT Suluh Ardhi Engineering &copy; 2026. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDummyData}
              className="text-[11px] text-slate-400 hover:text-red-600 transition underline cursor-pointer"
              title="Reset data ke bawaan awal"
            >
              Reset Data Dummy
            </button>
            <span className="text-[11px] text-slate-400">
              Versi Demo 1.1
            </span>
          </div>
        </footer>
      </div>

      {/* Floating Accessibility Controls */}
      <AccessibilityWidget />
    </div>
  );
}
