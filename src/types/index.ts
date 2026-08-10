// ============================================================================
// SmartTour — TypeScript Type Definitions
// ============================================================================

// --- Location Types ---

export type LocationCategory =
  | 'temple'
  | 'ghat'
  | 'trek'
  | 'viewpoint'
  | 'parking'
  | 'entry'
  | 'rest'
  | 'water'
  | 'other';

export type TrekDifficulty = 'easy' | 'moderate' | 'hard' | 'expert';

export interface TouristLocation {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  images: string[];
  qrCodeId: string;
  difficulty?: TrekDifficulty;
  distance?: string;
  facilities: string[];
  importantInfo?: string;
  isActive: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// --- Report / Complaint Types ---

export type ReportCategory =
  | 'garbage'
  | 'road'
  | 'trek'
  | 'network'
  | 'water'
  | 'toilet'
  | 'lighting'
  | 'signboard'
  | 'parking'
  | 'infrastructure'
  | 'safety'
  | 'other';

export type ReportStatus =
  | 'reported'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';

export type NetworkIssueType =
  | 'no_network'
  | 'weak'
  | 'no_internet'
  | 'provider_issue';

export interface Report {
  id: string;
  reportId: string; // Human-readable: ST-2026-XXXXXX
  locationId: string;
  locationName: string;
  category: ReportCategory;
  title: string;
  description: string;
  imageUrls: string[];
  imageRefs: string[];
  latitude?: number;
  longitude?: number;
  status: ReportStatus;
  priority: ReportPriority;
  assignedTo?: string;
  adminNotes: (string | AdminNote)[];
  aiSuggestedCategory?: ReportCategory;
  aiSuggestedPriority?: ReportPriority;
  networkProvider?: string;
  networkIssueType?: NetworkIssueType;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface AdminNote {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

// --- QR Scan Types ---

export interface QRScan {
  id: string;
  locationId: string;
  qrCodeId: string;
  timestamp: Date;
  userAgent: string;
}

// --- User Types ---

export type UserRole = 'admin' | 'staff';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
}

// --- Trek Route Types ---

export interface TrekCheckpoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  type: 'start' | 'end' | 'rest' | 'danger' | 'viewpoint' | 'checkpoint';
}

export interface TrekRoute {
  id: string;
  locationId: string;
  name: string;
  difficulty: TrekDifficulty;
  distance: string;
  estimatedTime: string;
  checkpoints: TrekCheckpoint[];
  path: [number, number][]; // [lat, lng] pairs
  dangerousSections: string[];
  createdAt: Date;
  updatedAt: Date;
}

// --- Dashboard / Analytics Types ---

export interface DashboardStats {
  totalReports: number;
  newReports: number;
  pendingReports: number;
  inProgressReports: number;
  resolvedReports: number;
  totalLocations: number;
  qrScans: number;
  reportsThisWeek: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

// --- Form Types ---

export interface ReportFormData {
  locationId: string;
  category: ReportCategory;
  title: string;
  description: string;
  images: File[];
  networkProvider?: string;
  networkIssueType?: NetworkIssueType;
}

export interface LocationFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  images: File[];
  difficulty?: TrekDifficulty;
  distance?: string;
  facilities: string[];
  importantInfo?: string;
}

// --- Filter Types ---

export interface ReportFilters {
  status?: ReportStatus;
  category?: ReportCategory;
  locationId?: string;
  priority?: ReportPriority;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface LocationFilters {
  category?: LocationCategory;
  search?: string;
  isActive?: boolean;
}
