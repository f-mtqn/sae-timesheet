// Utilitas untuk ekspor data timesheet ke CSV/Excel dan Print/PDF

export function exportToCSV(filename, headers, rows) {
  // Format CSV dengan BOM UTF-8 agar karakter Indonesia dan aksen terbaca rapi di Excel
  const csvRows = [];
  
  // Header
  csvRows.push(headers.map(h => `"${(h || '').replace(/"/g, '""')}"`).join(','));

  // Data rows
  rows.forEach(row => {
    const formattedRow = row.map(val => {
      const stringVal = val === null || val === undefined ? '' : String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(formattedRow.join(','));
  });

  const csvString = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrint() {
  window.print();
}
