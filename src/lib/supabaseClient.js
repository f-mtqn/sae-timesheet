import { createClient } from '@supabase/supabase-js';
import { getTodayWIB } from '../utils/timeCalculations';

const SUPABASE_URL = 'https://yuexidbryzqhvcovoeyv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZXhpZGJyeXpxaHZjb3ZvZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4Mzg0MTksImV4cCI6MjEwNDQxNDQxOX0.TZrNXYtASJM3HHz-e0GcWc9YPKlX8p1Vpexew4eIDA8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 1. DATA MAPPERS (snake_case <-> camelCase)
// ==========================================

export function mapEmployeeFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    employeeCode: row.employee_code,
    namaLengkap: row.nama_lengkap,
    email: row.email,
    posisi: row.posisi,
    departemen: row.departemen,
    noTelepon: row.no_telepon || '',
    role: row.role || 'user',
    status: row.status || 'aktif',
    tanggalBergabung: row.tanggal_bergabung || '',
  };
}

export function mapEmployeeToDB(emp) {
  return {
    employee_code: emp.employeeCode || emp.id || `EMP-${Date.now().toString().slice(-4)}`,
    nama_lengkap: emp.namaLengkap,
    email: emp.email,
    posisi: emp.posisi,
    departemen: emp.departemen,
    no_telepon: emp.noTelepon || null,
    role: emp.role || 'user',
    status: emp.status || 'aktif',
    tanggal_bergabung: emp.tanggalBergabung || new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };
}

export function mapTimesheetFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeCode: row.employee_code,
    employeeName: row.employee_name,
    position: row.position,
    date: row.date,
    checkIn: row.check_in,
    checkOut: row.check_out,
    totalHours: Number(row.total_hours) || 0,
    workHoursFormatted: row.work_hours_formatted || `${row.total_hours} jam`,
    lateMinutes: Number(row.late_minutes) || 0,
    overtimeHours: Number(row.overtime_hours) || 0,
    description: row.description || '',
    createdAt: row.created_at,
  };
}

export function mapTimesheetToDB(ts) {
  return {
    employee_id: ts.employeeId,
    employee_code: ts.employeeCode || ts.employeeId || 'EMP',
    employee_name: ts.employeeName,
    position: ts.position,
    date: ts.date,
    check_in: ts.checkIn,
    check_out: ts.checkOut,
    total_hours: Number(ts.totalHours) || 0,
    work_hours_formatted: ts.workHoursFormatted || '',
    late_minutes: Number(ts.lateMinutes) || 0,
    overtime_hours: Number(ts.overtimeHours) || 0,
    description: ts.description || '',
    updated_at: new Date().toISOString(),
  };
}

export function mapSettingsFromDB(row) {
  if (!row) return null;
  return {
    jamMasukStandar: row.jam_masuk_standar || '08:00',
    jamKerjaStandarHarian: Number(row.jam_kerja_standar_harian) || 8,
    toleransiKeterlambatan: Number(row.toleransi_keterlambatan) || 10,
    pembulatanLembur: Number(row.pembulatan_lembur) || 30,
    hariToleransiSusulan: Number(row.hari_toleransi_susulan) || 2,
    emailRekapOtomatis: row.email_rekap_otomatis ?? true,
  };
}

export function mapSettingsToDB(s) {
  return {
    id: 1,
    jam_masuk_standar: s.jamMasukStandar,
    jam_kerja_standar_harian: Number(s.jamKerjaStandarHarian),
    toleransi_keterlambatan: Number(s.toleransiKeterlambatan),
    pembulatan_lembur: Number(s.pembulatanLembur),
    hari_toleransi_susulan: Number(s.hariToleransiSusulan),
    email_rekap_otomatis: s.emailRekapOtomatis,
    updated_at: new Date().toISOString(),
  };
}

// ==========================================
// 2. AUTHENTICATION HELPERS
// ==========================================

export async function loginWithSupabase(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: password,
  });

  if (error) {
    throw error;
  }

  // Fetch linked employee profile
  const { data: emp, error: empErr } = await supabase
    .from('employees')
    .select('*')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (empErr) {
    console.error('Error fetching employee profile:', empErr);
  }

  // If profile exists in employees table, check status
  if (emp) {
    if (emp.status === 'nonaktif') {
      await supabase.auth.signOut();
      throw new Error('Akun ini telah dinonaktifkan oleh administrator.');
    }
    return mapEmployeeFromDB(emp);
  }

  // Fallback if user is in auth but not yet in employees
  return {
    id: data.user.id,
    authUserId: data.user.id,
    employeeCode: 'EMP-NEW',
    namaLengkap: data.user.user_metadata?.nama_lengkap || cleanEmail.split('@')[0],
    email: cleanEmail,
    posisi: cleanEmail.includes('admin') ? 'HR Admin' : 'Engineer',
    departemen: cleanEmail.includes('admin') ? 'Human Resources' : 'Engineering',
    role: cleanEmail.includes('admin') ? 'admin' : 'user',
    status: 'aktif',
    tanggalBergabung: new Date().toISOString().split('T')[0],
  };
}

export async function logoutFromSupabase() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error logging out:', error);
}

export async function registerWithSupabase({ email, password, namaLengkap, noTelepon, posisi, departemen }) {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Generate next employee code
  const { data: existingEmps } = await supabase
    .from('employees')
    .select('employee_code')
    .order('created_at', { ascending: false });

  let nextNum = 3;
  if (existingEmps && existingEmps.length > 0) {
    const nums = existingEmps
      .map(e => parseInt(e.employee_code?.replace('EMP-', '') || '0', 10))
      .filter(n => !isNaN(n));
    if (nums.length > 0) {
      nextNum = Math.max(...nums) + 1;
    }
  }
  const nextCode = `EMP-${String(nextNum).padStart(3, '0')}`;

  // 2. Sign up with Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: cleanEmail,
    password: password,
    options: {
      data: {
        nama_lengkap: namaLengkap,
        no_telepon: noTelepon,
        posisi: posisi || 'Staff Engineering',
        departemen: departemen || 'Engineering',
      },
    },
  });

  if (signUpError) {
    throw signUpError;
  }

  const authUserId = authData?.user?.id;

  // 3. Upsert into public.employees
  const newEmpPayload = {
    auth_user_id: authUserId,
    employee_code: nextCode,
    nama_lengkap: namaLengkap.trim(),
    email: cleanEmail,
    posisi: posisi?.trim() || 'Staff Engineering',
    departemen: departemen?.trim() || 'Engineering',
    no_telepon: noTelepon?.trim() || '-',
    role: 'user',
    status: 'aktif',
    tanggal_bergabung: getTodayWIB(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: createdEmp, error: insertError } = await supabase
    .from('employees')
    .upsert(newEmpPayload, { onConflict: 'email' })
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting employee profile:', insertError);
  }

  // 4. Perform direct sign-in so session is ready immediately
  return await loginWithSupabase(cleanEmail, password);
}

// ==========================================
// 3. DATA API HELPERS
// ==========================================

export async function getEmployeesFromSupabase() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
  return (data || []).map(mapEmployeeFromDB);
}

export async function upsertEmployeeToSupabase(empData) {
  const payload = mapEmployeeToDB(empData);
  
  if (empData.id && empData.id.includes('-') && empData.id.length > 20) {
    // UUID update
    const { data, error } = await supabase
      .from('employees')
      .update(payload)
      .eq('id', empData.id)
      .select()
      .single();
    if (error) throw error;
    return mapEmployeeFromDB(data);
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('employees')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return mapEmployeeFromDB(data);
  }
}

export async function toggleEmployeeStatusInSupabase(empId, currentStatus) {
  const nextStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
  const { data, error } = await supabase
    .from('employees')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', empId)
    .select()
    .single();

  if (error) throw error;
  return mapEmployeeFromDB(data);
}

export async function getTimesheetsFromSupabase() {
  const { data, error } = await supabase
    .from('timesheets')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching timesheets:', error);
    throw error;
  }
  return (data || []).map(mapTimesheetFromDB);
}

export async function saveTimesheetToSupabase(tsData) {
  const payload = mapTimesheetToDB(tsData);

  // Check if entry for this employee and date already exists
  const { data: existing } = await supabase
    .from('timesheets')
    .select('id')
    .eq('employee_id', tsData.employeeId)
    .eq('date', tsData.date)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from('timesheets')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return mapTimesheetFromDB(data);
  } else {
    const { data, error } = await supabase
      .from('timesheets')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return mapTimesheetFromDB(data);
  }
}

export async function getSettingsFromSupabase() {
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
  return mapSettingsFromDB(data);
}

export async function saveSettingsToSupabase(settingsData) {
  const payload = mapSettingsToDB(settingsData);
  const { data, error } = await supabase
    .from('company_settings')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return mapSettingsFromDB(data);
}

// ==========================================
// 4. LATE ENTRY PERMITS (IZIN SUSULAN)
// ==========================================

export function mapLateEntryPermitFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeCode: row.employee_code,
    employeeName: row.employee_name,
    permittedDate: row.permitted_date,
    reason: row.reason,
    status: row.status || 'pending',
    createdBy: row.created_by || 'Admin',
    createdAt: row.created_at,
  };
}

export async function getLateEntryPermitsFromSupabase() {
  const { data, error } = await supabase
    .from('late_entry_permits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching late entry permits:', error);
    return [];
  }
  return (data || []).map(mapLateEntryPermitFromDB);
}

export async function grantLateEntryPermitInSupabase({ employeeId, employeeCode, employeeName, permittedDate, reason }) {
  const { data, error } = await supabase
    .from('late_entry_permits')
    .insert([{
      employee_id: employeeId,
      employee_code: employeeCode,
      employee_name: employeeName,
      permitted_date: permittedDate,
      reason: reason.trim(),
      status: 'pending',
      created_by: 'Admin HR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return mapLateEntryPermitFromDB(data);
}

export async function completeLateEntryPermitInSupabase(employeeId, date) {
  const { data, error } = await supabase
    .from('late_entry_permits')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('employee_id', employeeId)
    .eq('permitted_date', date)
    .eq('status', 'pending')
    .select();

  if (error) {
    console.error('Error updating late entry permit:', error);
  }
  return data;
}

export async function revokeLateEntryPermitInSupabase(permitId) {
  const { data, error } = await supabase
    .from('late_entry_permits')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('id', permitId)
    .select()
    .single();

  if (error) throw error;
  return mapLateEntryPermitFromDB(data);
}
