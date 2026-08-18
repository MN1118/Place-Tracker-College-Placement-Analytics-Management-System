/**
 * Client-side export utilities so reports can be downloaded as CSV, Excel (.xlsx)
 * or PDF without requiring a server-side binary generation dependency.
 */
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function toRows(data) {
  if (!data || data.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => row[h]));
  return { headers, rows };
}

export function exportToCsv(filename, data) {
  const { headers, rows } = toRows(data);
  const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export function exportToExcel(filename, data, sheetName = 'Report') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPdf(filename, title, data) {
  const { headers, rows } = toRows(data);
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  autoTable(doc, { head: [headers], body: rows, startY: 22, styles: { fontSize: 8 } });
  doc.save(`${filename}.pdf`);
}
