// Utilitas kalkulasi jam kerja, keterlambatan, dan lembur

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatMinutesToHoursMinutes(totalMinutes) {
  if (isNaN(totalMinutes) || totalMinutes <= 0) return '0 jam 0 menit';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours} jam ${minutes} menit`;
}

export function calculateTimesheetMetrics(checkIn, checkOut, settings) {
  if (!checkIn || !checkOut) {
    return {
      totalMinutes: 0,
      totalHours: 0,
      workHoursFormatted: "0 jam 0 menit",
      lateMinutes: 0,
      overtimeHours: 0,
      status: "normal",
    };
  }

  const inMinutes = parseTimeToMinutes(checkIn);
  let outMinutes = parseTimeToMinutes(checkOut);

  // Jika keluar lewat tengah malam (misal shift malam)
  if (outMinutes < inMinutes) {
    outMinutes += 24 * 60;
  }

  const totalMinutes = Math.max(0, outMinutes - inMinutes);
  const totalHours = parseFloat((totalMinutes / 60).toFixed(2));

  // Hitung keterlambatan berdasarkan jam masuk standar + toleransi
  const standardInMinutes = parseTimeToMinutes(settings?.jamMasukStandar || "08:00");
  const tolerance = Number(settings?.toleransiKeterlambatan || 10);
  
  let lateMinutes = 0;
  if (inMinutes > (standardInMinutes + tolerance)) {
    lateMinutes = inMinutes - standardInMinutes;
  }

  // Hitung lembur berdasarkan jam kerja standar harian
  const standardWorkHours = Number(settings?.jamKerjaStandarHarian || 8);
  const standardWorkMinutes = standardWorkHours * 60;
  let overtimeMinutes = 0;

  if (totalMinutes > standardWorkMinutes) {
    overtimeMinutes = totalMinutes - standardWorkMinutes;
  }

  // Pembulatan lembur
  const rounding = Number(settings?.pembulatanLembur || 30);
  let overtimeHours = 0;
  if (overtimeMinutes > 0) {
    // Bulatkan ke kelipatan rounding terdekat ke bawah atau standar 30m
    const roundedMinutes = Math.floor(overtimeMinutes / rounding) * rounding;
    overtimeHours = parseFloat((roundedMinutes / 60).toFixed(1));
  }

  // Tentukan status
  let status = "normal";
  const isLate = lateMinutes > 0;
  const isOvertime = overtimeHours > 0;

  if (isLate && isOvertime) {
    status = "telat_lembur";
  } else if (isLate) {
    status = "telat";
  } else if (isOvertime) {
    status = "lembur";
  }

  return {
    totalMinutes,
    totalHours,
    workHoursFormatted: formatMinutesToHoursMinutes(totalMinutes),
    lateMinutes,
    overtimeHours,
    status,
  };
}

// Mengambil tanggal hari ini dalam format YYYY-MM-DD sesuai zona Waktu Indonesia Barat (WIB, UTC+7)
export function getTodayWIB() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

// Format tanggal ke Bahasa Indonesia lengkap (misal: "Selasa, 08 September 2026")
export function formatDateIndoWIB(dateStr) {
  if (!dateStr) return '';
  try {
    const dateObj = new Date(`${dateStr}T12:00:00+07:00`);
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  } catch (e) {
    return dateStr;
  }
}
