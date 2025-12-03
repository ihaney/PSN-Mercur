/**
 * Temporary stub for CSV template helper
 * TODO: Migrate full implementation from psn-a1-site-4
 */

export interface ProductCSVRow {
  [key: string]: string | number
}

export function generateCSVTemplate(data: any[]): string {
  // Stub implementation
  console.warn('generateCSVTemplate not yet implemented')
  return ''
}

export function parseCSVTemplate(csv: string): any[] {
  // Stub implementation
  console.warn('parseCSVTemplate not yet implemented')
  return []
}

export function parseCSV(csv: string): ProductCSVRow[] {
  // Stub implementation
  console.warn('parseCSV not yet implemented')
  return []
}

export function downloadCSVTemplate() {
  // Stub implementation
  console.warn('downloadCSVTemplate not yet implemented')
}

