export type ReportType = 'SERVICE' | 'SITE_WORK' | 'MAINTENANCE';
export type ReportStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'COMPLETED' | 'EMAILED' | 'VOIDED' | 'ARCHIVED';
export type UserRole = 'ADMIN' | 'ENGINEER' | 'MANAGER';

export interface UserSession {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  signatureData?: string | null;
}

export interface ChecklistItem {
  id: string;
  text: string;
  type: 'status' | 'measurement' | 'checkbox' | 'text';
  options?: ('OK' | 'PL' | 'N/A' | string)[];
  spec?: string;
  unit?: string;
  target?: number;
  tolerance?: number;
  photoRequired?: boolean;
}

export interface ChecklistSection {
  id: string;
  code?: string;
  title: string;
  instructions?: string;
  items: ChecklistItem[];
}

export interface ChecklistTemplateData {
  id: string;
  title: string;
  category: string;
  description?: string;
  isDefault: boolean;
  sections: ChecklistSection[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistValue {
  status?: 'OK' | 'PL' | 'N/A' | string;
  value?: string | number;
  remarks?: string;
  photoUrl?: string;
}

export interface ServiceReportData {
  reportedFault: string;
  engineersReport: string;
  downtimeRisk?: {
    repair: string;
    replacement: string;
  };
  equipmentTags?: string[];
  recommendations?: string;
  spareParts?: Array<{ item: string; partNo?: string; qty: number; remarks?: string }>;
}

export interface SiteReportData {
  workDescription: string;
  personInCharge?: string;
  witnessName?: string;
  verifiedName?: string;
  siteNotes?: string;
  nextActionRequired?: string;
  followUpDate?: string;
}

export interface MaintenanceReportData {
  checklistResponses: Record<string, ChecklistValue>; // key is itemId
  customChecklistItems?: Array<{
    id: string;
    sectionId?: string;
    text: string;
    status: 'OK' | 'PL' | 'N/A';
    remarks?: string;
  }>;
  concernsAndSuggestions?: string;
  overallOkCount?: number;
  overallPlCount?: number;
}

export interface ReportPhotoItem {
  id?: string;
  url: string;
  caption?: string;
  sectionKey?: string;
}

export interface FullReport {
  id: string;
  reportNumber: string;
  type: ReportType;
  status: ReportStatus;
  customerId?: string | null;
  customer?: {
    id: string;
    name: string;
    regNo?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    contactPerson?: string | null;
  } | null;
  siteId?: string | null;
  site?: {
    id: string;
    name: string;
    address?: string | null;
    contactPerson?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
  } | null;
  authorId?: string | null;
  author?: {
    id: string;
    name: string;
    username: string;
    email: string;
  } | null;
  title?: string | null;
  projectCode?: string | null;
  reportDate: string;
  attendanceDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  normalHours?: number | null;
  otHours?: number | null;
  data: ServiceReportData | SiteReportData | MaintenanceReportData | any;
  photos: ReportPhotoItem[];
  engineerName?: string | null;
  engineerSignature?: string | null;
  engineerSignedAt?: string | null;
  customerName?: string | null;
  customerDesignation?: string | null;
  customerSignature?: string | null;
  customerSignedAt?: string | null;
  emailedTo?: string | null;
  emailedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
