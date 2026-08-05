// ============================================================================
// SmartTour — Constants
// ============================================================================

import type {
  ReportCategory,
  ReportStatus,
  ReportPriority,
  LocationCategory,
  TrekDifficulty,
  NetworkIssueType,
} from '../types';

// --- Report Categories ---

export interface CategoryInfo {
  value: ReportCategory;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const REPORT_CATEGORIES: CategoryInfo[] = [
  { value: 'garbage', label: 'Garbage', icon: '🗑️', color: '#B45309', bgColor: '#FEF3C7' },
  { value: 'road', label: 'Road / Path Problem', icon: '🚧', color: '#DC2626', bgColor: '#FEE2E2' },
  { value: 'trek', label: 'Trekking Route', icon: '🥾', color: '#059669', bgColor: '#D1FAE5' },
  { value: 'network', label: 'Network Problem', icon: '📶', color: '#7C3AED', bgColor: '#EDE9FE' },
  { value: 'water', label: 'Water Problem', icon: '💧', color: '#2563EB', bgColor: '#DBEAFE' },
  { value: 'toilet', label: 'Toilet / Sanitation', icon: '🚻', color: '#DB2777', bgColor: '#FCE7F3' },
  { value: 'lighting', label: 'Lighting Problem', icon: '💡', color: '#D97706', bgColor: '#FEF3C7' },
  { value: 'signboard', label: 'Missing / Damaged Sign', icon: '🪧', color: '#0891B2', bgColor: '#CFFAFE' },
  { value: 'parking', label: 'Parking Issue', icon: '🅿️', color: '#4F46E5', bgColor: '#E0E7FF' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️', color: '#64748B', bgColor: '#F1F5F9' },
  { value: 'safety', label: 'Safety Concern', icon: '⚠️', color: '#DC2626', bgColor: '#FEE2E2' },
  { value: 'other', label: 'Other', icon: '📌', color: '#6B7280', bgColor: '#F3F4F6' },
];

export const CATEGORY_MAP = Object.fromEntries(
  REPORT_CATEGORIES.map((c) => [c.value, c])
) as Record<ReportCategory, CategoryInfo>;

// --- Report Statuses ---

export interface StatusInfo {
  value: ReportStatus;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  dotColor: string;
}

export const REPORT_STATUSES: StatusInfo[] = [
  { value: 'reported', label: 'Reported', icon: '🟡', color: '#D97706', bgColor: '#FEF3C7', dotColor: '#F59E0B' },
  { value: 'under_review', label: 'Under Review', icon: '🔵', color: '#2563EB', bgColor: '#DBEAFE', dotColor: '#3B82F6' },
  { value: 'in_progress', label: 'In Progress', icon: '🟠', color: '#EA580C', bgColor: '#FFF7ED', dotColor: '#F97316' },
  { value: 'resolved', label: 'Resolved', icon: '🟢', color: '#059669', bgColor: '#D1FAE5', dotColor: '#10B981' },
  { value: 'closed', label: 'Closed', icon: '⚫', color: '#6B7280', bgColor: '#F3F4F6', dotColor: '#9CA3AF' },
];

export const STATUS_MAP = Object.fromEntries(
  REPORT_STATUSES.map((s) => [s.value, s])
) as Record<ReportStatus, StatusInfo>;

// --- Priorities ---

export interface PriorityInfo {
  value: ReportPriority;
  label: string;
  color: string;
  bgColor: string;
}

export const REPORT_PRIORITIES: PriorityInfo[] = [
  { value: 'low', label: 'Low', color: '#059669', bgColor: '#D1FAE5' },
  { value: 'medium', label: 'Medium', color: '#D97706', bgColor: '#FEF3C7' },
  { value: 'high', label: 'High', color: '#EA580C', bgColor: '#FFF7ED' },
  { value: 'critical', label: 'Critical', color: '#DC2626', bgColor: '#FEE2E2' },
];

export const PRIORITY_MAP = Object.fromEntries(
  REPORT_PRIORITIES.map((p) => [p.value, p])
) as Record<ReportPriority, PriorityInfo>;

// --- Location Categories ---

export interface LocationCategoryInfo {
  value: LocationCategory;
  label: string;
  icon: string;
  color: string;
}

export const LOCATION_CATEGORIES: LocationCategoryInfo[] = [
  { value: 'temple', label: 'Temple', icon: '🛕', color: '#D97706' },
  { value: 'ghat', label: 'Ghat', icon: '🏞️', color: '#2563EB' },
  { value: 'trek', label: 'Trekking Point', icon: '🥾', color: '#059669' },
  { value: 'viewpoint', label: 'Viewpoint', icon: '🏔️', color: '#7C3AED' },
  { value: 'parking', label: 'Parking Area', icon: '🅿️', color: '#4F46E5' },
  { value: 'entry', label: 'Entry Point', icon: '🚪', color: '#0891B2' },
  { value: 'rest', label: 'Rest Area', icon: '🪑', color: '#64748B' },
  { value: 'water', label: 'Water Point', icon: '💧', color: '#0EA5E9' },
  { value: 'other', label: 'Other', icon: '📍', color: '#6B7280' },
];

export const LOCATION_CATEGORY_MAP = Object.fromEntries(
  LOCATION_CATEGORIES.map((l) => [l.value, l])
) as Record<LocationCategory, LocationCategoryInfo>;

// --- Trek Difficulties ---

export const TREK_DIFFICULTIES: { value: TrekDifficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: '#059669' },
  { value: 'moderate', label: 'Moderate', color: '#D97706' },
  { value: 'hard', label: 'Hard', color: '#EA580C' },
  { value: 'expert', label: 'Expert', color: '#DC2626' },
];

// --- Network Issue Types ---

export const NETWORK_ISSUE_TYPES: { value: NetworkIssueType; label: string }[] = [
  { value: 'no_network', label: 'No Network' },
  { value: 'weak', label: 'Weak Signal' },
  { value: 'no_internet', label: 'Internet Unavailable' },
  { value: 'provider_issue', label: 'Provider-Specific Issue' },
];

// --- Sample Tourist Locations (for demo/seed) ---

export const SAMPLE_LOCATIONS = [
  {
    name: 'Bopdev Ghat',
    slug: 'bopdev-ghat',
    shortDescription: 'A scenic ghat nestled in the Sahyadri hills, popular for trekking and nature walks.',
    description: 'Bopdev Ghat is a mountain pass located in the Pune district of Maharashtra. It connects Pune city to the Bhor region. The ghat section is known for its scenic beauty, lush greenery, and multiple trekking trails. It is a popular spot for nature enthusiasts, trekkers, and weekend visitors. The area features ancient caves, panoramic viewpoints, and rich biodiversity.',
    category: 'ghat' as LocationCategory,
    latitude: 18.4529,
    longitude: 73.8774,
    images: ['/images/bopdev-ghat.jpg', '/images/bopdev-viewpoint.jpg'],
    facilities: ['Parking', 'Trail Markers', 'Viewpoints', 'Local Food Stalls'],
    difficulty: 'moderate' as TrekDifficulty,
    distance: '6 km one way',
    importantInfo: 'Best visited during monsoon and winter. Carry enough water. Mobile network may be spotty in deeper sections.',
    qrCodeId: 'qr-bopdev-ghat-001',
    isActive: true,
    reportCount: 12,
  },
  {
    name: 'Kanifnath Temple',
    slug: 'kanifnath-temple',
    shortDescription: 'An ancient hilltop temple dedicated to Saint Kanifnath, offering stunning valley views.',
    description: 'Kanifnath Temple is an ancient temple situated atop a hill near Saswad in Pune district. Dedicated to the Nath Sampradaya saint Kanifnath, it is both a religious pilgrimage site and a popular trekking destination. The temple offers breathtaking panoramic views of the surrounding valleys and mountains. The trek to the temple is of moderate difficulty and passes through scenic terrain.',
    category: 'temple' as LocationCategory,
    latitude: 18.3452,
    longitude: 73.9876,
    images: ['/images/kanifnath-temple.jpg'],
    facilities: ['Parking at Base', 'Steps to Temple', 'Water Availability', 'Shoe Storage'],
    difficulty: 'moderate' as TrekDifficulty,
    distance: '3 km from base',
    importantInfo: 'Temple is open all days. During festivals, expect heavy crowds. Wear comfortable shoes for the climb.',
    qrCodeId: 'qr-kanifnath-001',
    isActive: true,
    reportCount: 8,
  },
  {
    name: 'Bopdev Ghat Viewpoint',
    slug: 'bopdev-ghat-viewpoint',
    shortDescription: 'A stunning hilltop viewpoint overlooking the valley and Sahyadri ranges.',
    description: 'This viewpoint at Bopdev Ghat offers one of the most spectacular panoramic views in the region. On clear days, you can see vast stretches of the Sahyadri ranges and the valley below. It is a popular spot for photography and sunrise/sunset views.',
    category: 'viewpoint' as LocationCategory,
    latitude: 18.4485,
    longitude: 73.8720,
    images: ['/images/bopdev-viewpoint.jpg'],
    facilities: ['Resting Spots', 'Photo Points'],
    importantInfo: 'Best time for sunrise viewing is 6:00-6:30 AM. Be careful near cliff edges.',
    qrCodeId: 'qr-bopdev-viewpoint-001',
    isActive: true,
    reportCount: 5,
  },
  {
    name: 'Bopdev Ghat Parking',
    slug: 'bopdev-ghat-parking',
    shortDescription: 'Main parking area at the base of Bopdev Ghat trekking trails.',
    description: 'The main parking area at Bopdev Ghat provides space for cars and two-wheelers. From here, visitors can access the main trekking trail and the ghat road. Basic amenities like local food stalls are available nearby.',
    category: 'parking' as LocationCategory,
    latitude: 18.4560,
    longitude: 73.8810,
    images: ['/images/parking-area.jpg'],
    facilities: ['Two-Wheeler Parking', 'Car Parking', 'Food Stalls Nearby'],
    importantInfo: 'Parking may be limited during weekends and holidays. Arrive early for spot availability.',
    qrCodeId: 'qr-bopdev-parking-001',
    isActive: true,
    reportCount: 3,
  },
  {
    name: 'Bopdev Ghat Trek Entry',
    slug: 'bopdev-ghat-trek-entry',
    shortDescription: 'The official starting point for the Bopdev Ghat trek.',
    description: 'This is the official entry point for the main Bopdev Ghat trekking trail. The trail from here leads through forest sections, open grasslands, and rocky terrain before reaching the viewpoint. Trail markers are placed at intervals to guide hikers.',
    category: 'entry' as LocationCategory,
    latitude: 18.4545,
    longitude: 73.8795,
    images: ['/images/trek-entry.jpg'],
    facilities: ['Trail Map Board', 'First Aid Info', 'Emergency Contact Board'],
    difficulty: 'moderate' as TrekDifficulty,
    distance: '6 km to summit',
    importantInfo: 'Register at the entry if registration desk is available. Carry ID proof.',
    qrCodeId: 'qr-bopdev-entry-001',
    isActive: true,
    reportCount: 7,
  },
  {
    name: 'Midway Rest Point',
    slug: 'midway-rest-point',
    shortDescription: 'A shaded rest area approximately halfway through the Bopdev Ghat trek.',
    description: 'Located approximately 3 km into the Bopdev Ghat trek, this natural rest point provides shade and relatively flat ground for trekkers to rest. Some seasonal water availability exists nearby. This is a good point to refuel before the steeper sections ahead.',
    category: 'rest' as LocationCategory,
    latitude: 18.4510,
    longitude: 73.8750,
    images: ['/images/rest-point.jpg'],
    facilities: ['Shade', 'Flat Ground', 'Seasonal Water'],
    importantInfo: 'Water availability depends on season. Do not rely on it—carry your own water.',
    qrCodeId: 'qr-midway-rest-001',
    isActive: true,
    reportCount: 4,
  },
];

// --- Trekking Routes (Polylines for Map) ---

export interface TrekkingRoute {
  id: string;
  name: string;
  locationSlug: string;
  difficulty: TrekDifficulty;
  color: string;
  distance: string;
  estimatedTime: string;
  positions: [number, number][];
}

export const TREKKING_ROUTES: TrekkingRoute[] = [
  {
    id: 'route-bopdev-main',
    name: 'Bopdev Ghat Summit Trail',
    locationSlug: 'bopdev-ghat',
    difficulty: 'moderate',
    color: '#059669',
    distance: '5.2 km',
    estimatedTime: '2 hours',
    positions: [
      [18.4560, 73.8810], // Parking
      [18.4545, 73.8795], // Entry
      [18.4530, 73.8770], // Trail midpoint 1
      [18.4510, 73.8750], // Midway Rest Point
      [18.4490, 73.8740], // Steep climb section
      [18.4475, 73.8725], // Ridge walk
      [18.4529, 73.8774], // Bopdev Ghat Viewpoint
    ],
  },
  {
    id: 'route-kanifnath-trek',
    name: 'Kanifnath Temple Hill Trail',
    locationSlug: 'kanifnath-temple',
    difficulty: 'moderate',
    color: '#D97706',
    distance: '3.8 km',
    estimatedTime: '1.5 hours',
    positions: [
      [18.4400, 73.9100], // Base village
      [18.4380, 73.9080], // Lower stairs section
      [18.4350, 73.9050], // Mid-hill plateau
      [18.4320, 73.9010], // Temple Approach Trail
      [18.4300, 73.8980], // Kanifnath Temple
    ],
  },
];


// --- App Config ---

export const APP_NAME = 'SmartTour';
export const APP_TAGLINE = 'Explore. Discover. Report. Improve.';
export const APP_DESCRIPTION =
  'Help make tourist destinations cleaner, safer and easier to explore by reporting problems directly from the location.';

export const REPORT_ID_PREFIX = 'ST';

// Image upload constraints
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGES_PER_REPORT = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

// Map defaults (centered on Bopdev Ghat area)
export const MAP_DEFAULT_CENTER: [number, number] = [18.4529, 73.8774];
export const MAP_DEFAULT_ZOOM = 13;
export const MAP_MIN_ZOOM = 8;
export const MAP_MAX_ZOOM = 18;
