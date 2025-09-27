import * as XLSX from 'xlsx';
import { Vendor, Volunteer, Speaker, AgendaItem } from '@/contexts/AppContext';

// Excel export functions
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Auto-adjust column widths
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const columnWidths: any[] = [];
  
  for (let col = range.s.c; col <= range.e.c; col++) {
    let maxWidth = 10;
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        const cellLength = cell.v.toString().length;
        maxWidth = Math.max(maxWidth, cellLength);
      }
    }
    columnWidths.push({ wch: Math.min(maxWidth + 2, 50) });
  }
  worksheet['!cols'] = columnWidths;
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportSpeakersToExcel = (speakers: Speaker[]) => {
  const data = speakers.map(speaker => ({
    Name: speaker.name,
    Bio: speaker.bio,
    Sessions: speaker.sessions.join(', '),
    Confirmed: speaker.confirmed ? 'Yes' : 'No'
  }));
  exportToExcel(data, 'speakers', 'Speakers');
};

export const exportVolunteersToExcel = (volunteers: Volunteer[]) => {
  const data = volunteers.map(volunteer => ({
    Name: volunteer.name,
    Email: volunteer.email,
    Skills: volunteer.skills.join(', '),
    'Assigned Tasks': volunteer.assignedTasks.length
  }));
  exportToExcel(data, 'volunteers', 'Volunteers');
};

export const exportVendorsToExcel = (vendors: Vendor[]) => {
  const data = vendors.map(vendor => ({
    Name: vendor.name,
    Contact: vendor.contact,
    'Service Type': vendor.serviceType,
    Status: vendor.status
  }));
  exportToExcel(data, 'vendors', 'Vendors');
};

export const exportAgendaToExcel = (agenda: AgendaItem[]) => {
  const data = agenda.map(item => ({
    Title: item.title,
    Type: item.type,
    'Start Time': item.startTime,
    'End Time': item.endTime,
    Speaker: item.speaker || '',
    Track: item.track
  }));
  exportToExcel(data, 'agenda', 'Agenda');
};

// Excel import functions
export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const validateSpeakerData = (data: any[]): Omit<Speaker, 'id'>[] => {
  return data.map(row => ({
    name: row.Name || row.name || '',
    bio: row.Bio || row.bio || '',
    sessions: (row.Sessions || row.sessions || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    confirmed: (row.Confirmed || row.confirmed || '').toLowerCase() === 'yes'
  })).filter(speaker => speaker.name) as Omit<Speaker, 'id'>[];
};

export const validateVolunteerData = (data: any[]): Omit<Volunteer, 'id'>[] => {
  return data.map(row => ({
    name: row.Name || row.name || '',
    email: row.Email || row.email || '',
    skills: (row.Skills || row.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    assignedTasks: []
  })).filter(volunteer => volunteer.name && volunteer.email) as Omit<Volunteer, 'id'>[];
};

export const validateVendorData = (data: any[]): Omit<Vendor, 'id'>[] => {
  return data.map(row => ({
    name: row.Name || row.name || '',
    contact: row.Contact || row.contact || '',
    serviceType: row['Service Type'] || row.serviceType || row['service type'] || '',
    status: (row.Status || row.status || 'pending') as 'active' | 'inactive' | 'pending'
  })).filter(vendor => vendor.name && vendor.contact) as Omit<Vendor, 'id'>[];
};