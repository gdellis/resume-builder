import { SavedResume, ResumeData, ResumeStyle } from '@/types/resume';

export interface ExportData {
  version: string;
  exportedAt: string;
  resumes: SavedResume[];
}

export function exportAllResumes(resumes: SavedResume[]): string {
  const data: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    resumes,
  };
  return JSON.stringify(data, null, 2);
}

export function exportSingleResume(resume: SavedResume): string {
  const data: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    resumes: [resume],
  };
  return JSON.stringify(data, null, 2);
}

export function importResumes(jsonString: string): { success: boolean; resumes?: SavedResume[]; error?: string } {
  try {
    const data = JSON.parse(jsonString) as ExportData;
    
    if (!data.resumes || !Array.isArray(data.resumes)) {
      return { success: false, error: 'Invalid file format: no resumes found' };
    }
    
    // Validate each resume has required fields
    const validResumes = data.resumes.filter((resume) => {
      return resume.id && resume.title && resume.data && resume.style;
    });
    
    if (validResumes.length === 0) {
      return { success: false, error: 'No valid resumes found in file' };
    }
    
    // Update timestamps for imported resumes
    const importedResumes = validResumes.map((resume) => ({
      ...resume,
      updatedAt: new Date().toISOString(),
    }));
    
    return { success: true, resumes: importedResumes };
  } catch (error) {
    return { success: false, error: 'Failed to parse file: invalid JSON' };
  }
}

export function downloadFile(content: string, filename: string, mimeType: string = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function validateResumeData(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data: not an object' };
  }
  
  const resume = data as Partial<SavedResume>;
  
  if (!resume.id) {
    return { valid: false, error: 'Missing required field: id' };
  }
  
  if (!resume.title) {
    return { valid: false, error: 'Missing required field: title' };
  }
  
  if (!resume.data || typeof resume.data !== 'object') {
    return { valid: false, error: 'Missing required field: data' };
  }
  
  if (!resume.style || typeof resume.style !== 'object') {
    return { valid: false, error: 'Missing required field: style' };
  }
  
  return { valid: true };
}
