/**
 * Struktur Organisasi PT Suluh Ardhi Engineering
 * Sumber: structural.txt
 *
 * Untuk TECHNOLOGY & ENGINEERING memiliki 2 departemen utama,
 * dan setiap departemen memiliki sub-departemen.
 * Field `departemen` di DB akan berisi nama sub-departemen akhir.
 */

export const ORG_STRUCTURE = [
  {
    divisi: "JAKARTA OFFICE",
    departemen: ["BOC & BOD"],
    subDepartemen: {},
  },
  {
    divisi: "PROJECT MANAGEMENT",
    departemen: ["Project Management"],
    subDepartemen: {},
  },
  {
    divisi: "TECHNOLOGY & ENGINEERING",
    departemen: ["Technology & Engineering", "QHSE"],
    subDepartemen: {
      "Technology & Engineering": [
        "Civil",
        "Instrument & Control System",
        "Electrical",
        "Process",
        "Piping",
        "Mechanical",
        "Information & Technology",
        "Commissioning",
      ],
      "QHSE": [
        "QHSE Department",
        "QAQC Department",
      ],
    },
  },
  {
    divisi: "BUSINESS DEVELOPMENT",
    departemen: ["Business Development"],
    subDepartemen: {},
  },
  {
    divisi: "CORPORATE SERVICE",
    departemen: ["Corporate Service"],
    subDepartemen: {
      "Corporate Service": [
        "Human Resources & Gen Affair",
        "Finance, Tax & Accounting",
        "Legal",
      ],
    },
  },
];

/**
 * Mendapatkan daftar divisi
 */
export function getDivisiList() {
  return ORG_STRUCTURE.map((d) => d.divisi);
}

/**
 * Mendapatkan daftar departemen berdasarkan divisi
 */
export function getDepartemenList(divisi) {
  const found = ORG_STRUCTURE.find((d) => d.divisi === divisi);
  return found ? found.departemen : [];
}

/**
 * Mendapatkan sub-departemen berdasarkan divisi dan departemen
 * Kembalikan [] jika tidak ada sub-departemen
 */
export function getSubDepartemenList(divisi, departemen) {
  const found = ORG_STRUCTURE.find((d) => d.divisi === divisi);
  if (!found) return [];
  return found.subDepartemen[departemen] || [];
}

/**
 * Cek apakah divisi+departemen ini memiliki sub-departemen
 */
export function hasSubDepartemen(divisi, departemen) {
  return getSubDepartemenList(divisi, departemen).length > 0;
}
