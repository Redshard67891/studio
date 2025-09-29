"use client";

import Papa from 'papaparse';

/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 * @param data - The array of objects to export.
 * @param filename - The name of the file to be downloaded (e.g., 'export.csv').
 */
export function exportToCsv(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn("Export Aborted: No data provided.");
    return;
  }
  
  try {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("Error exporting to CSV:", error);
  }
}
