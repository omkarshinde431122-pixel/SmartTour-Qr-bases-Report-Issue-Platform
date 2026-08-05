// ============================================================================
// SmartTour — Data Service (Mock + Firebase)
// ============================================================================
// Provides data access for locations and reports.
// When Firebase is not configured, uses local mock data for development.
// ============================================================================

import { isFirebaseConfigured, db } from '../firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type {
  TouristLocation,
  Report,
  ReportStatus,
  ReportCategory,
  ReportPriority,
  DashboardStats,
} from '../types';
import { SAMPLE_LOCATIONS } from '../constants';
import { generateReportId } from '../utils';

// ============================================================================
// MOCK DATA (used when Firebase is not configured)
// ============================================================================

let mockLocations: TouristLocation[] = SAMPLE_LOCATIONS.map((loc, idx) => ({
  ...loc,
  id: `loc-${idx + 1}`,
  images: [],
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-08-01'),
}));

let mockReports: Report[] = [
  {
    id: 'rpt-1',
    reportId: 'ST-2026-100001',
    locationId: 'loc-1',
    locationName: 'Bopdev Ghat',
    category: 'garbage',
    title: 'Garbage piling up near trekking entrance',
    description: 'There is a large amount of plastic waste and food packaging scattered near the main trekking entrance. The dustbins are overflowing and waste is spreading to the trail.',
    imageUrls: [],
    imageRefs: [],
    status: 'reported',
    priority: 'medium',
    adminNotes: [],
    createdAt: new Date('2026-08-03T10:30:00'),
    updatedAt: new Date('2026-08-03T10:30:00'),
  },
  {
    id: 'rpt-2',
    reportId: 'ST-2026-100002',
    locationId: 'loc-1',
    locationName: 'Bopdev Ghat',
    category: 'road',
    title: 'Road surface damaged after heavy rain',
    description: 'The approach road to the parking area has developed several large potholes after the recent heavy rainfall. Two-wheelers are finding it particularly difficult to navigate.',
    imageUrls: [],
    imageRefs: [],
    status: 'in_progress',
    priority: 'high',
    adminNotes: [],
    createdAt: new Date('2026-08-01T14:20:00'),
    updatedAt: new Date('2026-08-04T09:00:00'),
  },
  {
    id: 'rpt-3',
    reportId: 'ST-2026-100003',
    locationId: 'loc-2',
    locationName: 'Kanifnath Temple',
    category: 'signboard',
    title: 'Trail direction signs missing after rain',
    description: 'Several important trail direction signboards between the base and the temple have been damaged or washed away. This is causing confusion among visitors, especially first-time trekkers.',
    imageUrls: [],
    imageRefs: [],
    status: 'under_review',
    priority: 'medium',
    adminNotes: [],
    createdAt: new Date('2026-08-02T08:45:00'),
    updatedAt: new Date('2026-08-03T11:00:00'),
  },
  {
    id: 'rpt-4',
    reportId: 'ST-2026-100004',
    locationId: 'loc-3',
    locationName: 'Bopdev Ghat Viewpoint',
    category: 'safety',
    title: 'No safety railing at cliff viewpoint',
    description: 'The main viewpoint area has no safety railing or barrier at the cliff edge. This is extremely dangerous especially when it is crowded or the ground is wet.',
    imageUrls: [],
    imageRefs: [],
    status: 'reported',
    priority: 'critical',
    adminNotes: [],
    createdAt: new Date('2026-08-04T16:30:00'),
    updatedAt: new Date('2026-08-04T16:30:00'),
  },
  {
    id: 'rpt-5',
    reportId: 'ST-2026-100005',
    locationId: 'loc-5',
    locationName: 'Bopdev Ghat Trek Entry',
    category: 'trek',
    title: 'Trekking path difficult to identify',
    description: 'After the first 2 km, the main trekking path becomes very unclear. Multiple forks with no trail markers make it easy to get lost. We had to backtrack twice.',
    imageUrls: [],
    imageRefs: [],
    status: 'resolved',
    priority: 'medium',
    adminNotes: [],
    createdAt: new Date('2026-07-28T07:15:00'),
    updatedAt: new Date('2026-08-02T13:00:00'),
    resolvedAt: new Date('2026-08-02T13:00:00'),
  },
  {
    id: 'rpt-6',
    reportId: 'ST-2026-100006',
    locationId: 'loc-6',
    locationName: 'Midway Rest Point',
    category: 'water',
    title: 'Water source contaminated',
    description: 'The natural water source at the midway rest point appears to be contaminated. The water has a brownish tint and there is visible algae growth around the source.',
    imageUrls: [],
    imageRefs: [],
    status: 'in_progress',
    priority: 'high',
    adminNotes: [],
    createdAt: new Date('2026-08-03T12:00:00'),
    updatedAt: new Date('2026-08-04T10:30:00'),
  },
  {
    id: 'rpt-7',
    reportId: 'ST-2026-100007',
    locationId: 'loc-2',
    locationName: 'Kanifnath Temple',
    category: 'toilet',
    title: 'Public toilets not maintained',
    description: 'The public toilet facility near the temple parking area is in very poor condition. No water supply, broken door latches, and needs cleaning urgently.',
    imageUrls: [],
    imageRefs: [],
    status: 'reported',
    priority: 'medium',
    adminNotes: [],
    createdAt: new Date('2026-08-04T09:20:00'),
    updatedAt: new Date('2026-08-04T09:20:00'),
  },
  {
    id: 'rpt-8',
    reportId: 'ST-2026-100008',
    locationId: 'loc-4',
    locationName: 'Bopdev Ghat Parking',
    category: 'parking',
    title: 'Parking area too small for weekend crowds',
    description: 'On weekends the parking area is completely insufficient. Vehicles are being parked on the road which causes traffic jams and safety issues.',
    imageUrls: [],
    imageRefs: [],
    status: 'closed',
    priority: 'low',
    adminNotes: [],
    createdAt: new Date('2026-07-20T11:00:00'),
    updatedAt: new Date('2026-07-25T15:00:00'),
    resolvedAt: new Date('2026-07-25T15:00:00'),
  },
  {
    id: 'rpt-9',
    reportId: 'ST-2026-100009',
    locationId: 'loc-1',
    locationName: 'Bopdev Ghat',
    category: 'network',
    title: 'No mobile network coverage on trail',
    description: 'There is absolutely no mobile network coverage once you pass the first kilometer on the main trail. This is a safety concern as hikers cannot call for help in emergencies.',
    imageUrls: [],
    imageRefs: [],
    status: 'under_review',
    priority: 'high',
    networkProvider: 'All providers',
    networkIssueType: 'no_network',
    adminNotes: [],
    createdAt: new Date('2026-08-05T06:30:00'),
    updatedAt: new Date('2026-08-05T10:00:00'),
  },
  {
    id: 'rpt-10',
    reportId: 'ST-2026-100010',
    locationId: 'loc-1',
    locationName: 'Bopdev Ghat',
    category: 'lighting',
    title: 'No lighting on approach road after sunset',
    description: 'The approach road from the highway to the parking area has no street lights. Visitors returning after sunset find it very difficult and dangerous to navigate.',
    imageUrls: [],
    imageRefs: [],
    status: 'reported',
    priority: 'medium',
    adminNotes: [],
    createdAt: new Date('2026-08-05T18:45:00'),
    updatedAt: new Date('2026-08-05T18:45:00'),
  },
];

// ============================================================================
// LOCATION SERVICES
// ============================================================================

export async function getLocations(): Promise<TouristLocation[]> {
  if (!isFirebaseConfigured || !db) {
    return mockLocations;
  }

  try {
    const q = query(collection(db, 'locations'), orderBy('name'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return mockLocations;
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
    })) as TouristLocation[];
  } catch (err) {
    console.warn('Firestore getLocations failed (using fallback locations):', err);
    return mockLocations;
  }
}

export async function getLocationBySlug(slug: string): Promise<TouristLocation | null> {
  if (!isFirebaseConfigured || !db) {
    return mockLocations.find((l) => l.slug === slug) || null;
  }

  try {
    const q = query(collection(db, 'locations'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return mockLocations.find((l) => l.slug === slug) || null;
    }

    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: (docSnap.data().createdAt as Timestamp)?.toDate(),
      updatedAt: (docSnap.data().updatedAt as Timestamp)?.toDate(),
    } as TouristLocation;
  } catch (err) {
    console.warn('Firestore getLocationBySlug failed (using fallback):', err);
    return mockLocations.find((l) => l.slug === slug) || null;
  }
}

export async function getLocationById(id: string): Promise<TouristLocation | null> {
  if (!isFirebaseConfigured) {
    return mockLocations.find((l) => l.id === id) || null;
  }

  const docSnap = await getDoc(doc(db, 'locations', id));
  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: (docSnap.data().createdAt as Timestamp)?.toDate(),
    updatedAt: (docSnap.data().updatedAt as Timestamp)?.toDate(),
  } as TouristLocation;
}

export async function createLocation(data: Partial<TouristLocation>): Promise<string> {
  if (!isFirebaseConfigured) {
    const newId = `loc-${mockLocations.length + 1}`;
    const newLoc = {
      ...data,
      id: newId,
      images: data.images || [],
      facilities: data.facilities || [],
      isActive: true,
      reportCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TouristLocation;
    mockLocations.push(newLoc);
    return newId;
  }

  const docRef = await addDoc(collection(db, 'locations'), {
    ...data,
    isActive: true,
    reportCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateLocation(id: string, data: Partial<TouristLocation>): Promise<void> {
  if (!isFirebaseConfigured) {
    mockLocations = mockLocations.map((l) =>
      l.id === id ? { ...l, ...data, updatedAt: new Date() } : l
    );
    return;
  }

  await updateDoc(doc(db, 'locations', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ============================================================================
// REPORT SERVICES
// ============================================================================

export async function getReports(filters?: {
  status?: ReportStatus;
  category?: ReportCategory;
  locationId?: string;
  priority?: ReportPriority;
}): Promise<Report[]> {
  let reportsList: Report[] = [];

  if (isFirebaseConfigured && db) {
    try {
      let q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      if (filters?.status) q = query(q, where('status', '==', filters.status));
      if (filters?.category) q = query(q, where('category', '==', filters.category));
      if (filters?.locationId) q = query(q, where('locationId', '==', filters.locationId));

      const snapshot = await getDocs(q);
      reportsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
        resolvedAt: doc.data().resolvedAt ? (doc.data().resolvedAt as Timestamp)?.toDate() : undefined,
      })) as Report[];
    } catch (err) {
      console.warn('Firestore getReports failed (using local data):', err);
    }
  }

  // Merge with mock/local reports so local updates are never lost
  const map = new Map<string, Report>();
  mockReports.forEach((r) => map.set(r.reportId || r.id, r));
  reportsList.forEach((r) => {
    const existing = map.get(r.reportId || r.id);
    if (!existing || (r.updatedAt && existing.updatedAt && r.updatedAt >= existing.updatedAt)) {
      map.set(r.reportId || r.id, r);
    }
  });

  let merged = Array.from(map.values());
  if (filters?.status) merged = merged.filter((r) => r.status === filters.status);
  if (filters?.category) merged = merged.filter((r) => r.category === filters.category);
  if (filters?.locationId) merged = merged.filter((r) => r.locationId === filters.locationId);
  if (filters?.priority) merged = merged.filter((r) => r.priority === filters.priority);

  return merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Helper to save report in local memory & localStorage
function addMockReport(
  data: {
    locationId: string;
    locationName: string;
    category: ReportCategory;
    title: string;
    description: string;
    imageUrls?: string[];
    imageRefs?: string[];
    latitude?: number;
    longitude?: number;
    priority?: ReportPriority;
    networkProvider?: string;
    networkIssueType?: string;
    aiSuggestedCategory?: ReportCategory;
    aiSuggestedPriority?: ReportPriority;
  },
  existingReportId?: string
): string {
  const reportId = existingReportId || generateReportId();
  const newReport: Report = {
    id: `rpt-${mockReports.length + 1}`,
    reportId,
    locationId: data.locationId,
    locationName: data.locationName,
    category: data.category,
    title: data.title,
    description: data.description,
    imageUrls: data.imageUrls || [],
    imageRefs: data.imageRefs || [],
    latitude: data.latitude,
    longitude: data.longitude,
    status: 'reported',
    priority: data.priority || 'medium',
    adminNotes: [],
    aiSuggestedCategory: data.aiSuggestedCategory,
    aiSuggestedPriority: data.aiSuggestedPriority,
    networkProvider: data.networkProvider,
    networkIssueType: data.networkIssueType as Report['networkIssueType'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockReports.unshift(newReport);
  try {
    localStorage.setItem('smarttour_local_reports', JSON.stringify(mockReports));
  } catch (e) {
    // Ignore quota errors
  }
  return reportId;
}

export async function getReportByReportId(reportId: string): Promise<Report | null> {
  const localReport = mockReports.find((r) => r.reportId === reportId || r.id === reportId);

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'reports'), where('reportId', '==', reportId), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const remoteData = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: (docSnap.data().createdAt as Timestamp)?.toDate(),
          updatedAt: (docSnap.data().updatedAt as Timestamp)?.toDate(),
          resolvedAt: docSnap.data().resolvedAt ? (docSnap.data().resolvedAt as Timestamp)?.toDate() : undefined,
        } as Report;

        if (localReport && localReport.updatedAt > remoteData.updatedAt) {
          return { ...remoteData, ...localReport };
        }
        return remoteData;
      }
    } catch (err) {
      console.warn('Firestore getReportByReportId failed (using local data):', err);
    }
  }

  return localReport || null;
}

export async function createReport(data: {
  locationId: string;
  locationName: string;
  category: ReportCategory;
  title: string;
  description: string;
  imageUrls?: string[];
  imageRefs?: string[];
  latitude?: number;
  longitude?: number;
  priority?: ReportPriority;
  networkProvider?: string;
  networkIssueType?: string;
  aiSuggestedCategory?: ReportCategory;
  aiSuggestedPriority?: ReportPriority;
}): Promise<string> {
  const reportId = generateReportId();

  if (!isFirebaseConfigured || !db) {
    return addMockReport(data, reportId);
  }

  try {
    const firestoreData: Record<string, any> = {
      reportId,
      locationId: data.locationId,
      locationName: data.locationName,
      category: data.category,
      title: data.title,
      description: data.description,
      imageUrls: data.imageUrls || [],
      imageRefs: data.imageRefs || [],
      status: 'reported',
      priority: data.priority || 'medium',
      adminNotes: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (data.latitude !== undefined) firestoreData.latitude = data.latitude;
    if (data.longitude !== undefined) firestoreData.longitude = data.longitude;
    if (data.networkProvider) firestoreData.networkProvider = data.networkProvider;
    if (data.networkIssueType) firestoreData.networkIssueType = data.networkIssueType;
    if (data.aiSuggestedCategory) firestoreData.aiSuggestedCategory = data.aiSuggestedCategory;
    if (data.aiSuggestedPriority) firestoreData.aiSuggestedPriority = data.aiSuggestedPriority;

    await addDoc(collection(db, 'reports'), firestoreData);
    addMockReport(data, reportId);
    return reportId;
  } catch (err) {
    console.warn('Firestore write failed (falling back to local storage):', err);
    return addMockReport(data, reportId);
  }
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus
): Promise<void> {
  mockReports = mockReports.map((r) =>
    r.id === id || r.reportId === id
      ? {
          ...r,
          status,
          updatedAt: new Date(),
          resolvedAt: status === 'resolved' ? new Date() : r.resolvedAt,
        }
      : r
  );
  try {
    localStorage.setItem('smarttour_local_reports', JSON.stringify(mockReports));
  } catch (e) {}

  if (!isFirebaseConfigured || !db) return;

  try {
    const updates: Record<string, any> = {
      status,
      updatedAt: Timestamp.now(),
    };
    if (status === 'resolved') {
      updates.resolvedAt = Timestamp.now();
    }
    await updateDoc(doc(db, 'reports', id), updates);
  } catch (err) {
    console.warn('Firestore update failed (updated locally):', err);
  }
}

export async function updateReportPriority(
  id: string,
  priority: ReportPriority
): Promise<void> {
  mockReports = mockReports.map((r) =>
    r.id === id || r.reportId === id ? { ...r, priority, updatedAt: new Date() } : r
  );
  try {
    localStorage.setItem('smarttour_local_reports', JSON.stringify(mockReports));
  } catch (e) {}

  if (!isFirebaseConfigured || !db) return;

  try {
    await updateDoc(doc(db, 'reports', id), {
      priority,
      updatedAt: Timestamp.now(),
    });
  } catch (err) {
    console.warn('Firestore priority update failed:', err);
  }
}

export async function addAdminNote(id: string, note: string): Promise<void> {
  mockReports = mockReports.map((r) => {
    if (r.id === id || r.reportId === id) {
      return {
        ...r,
        adminNotes: [...(r.adminNotes || []), note],
        updatedAt: new Date(),
      };
    }
    return r;
  });
  try {
    localStorage.setItem('smarttour_local_reports', JSON.stringify(mockReports));
  } catch (e) {}

  if (!isFirebaseConfigured || !db) return;

  try {
    const docRef = doc(db, 'reports', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentNotes = docSnap.data().adminNotes || [];
      await updateDoc(docRef, {
        adminNotes: [...currentNotes, note],
        updatedAt: Timestamp.now(),
      });
    }
  } catch (err) {
    console.warn('Firestore note update failed:', err);
  }
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const reports = await getReports();
  const locations = await getLocations();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    totalReports: reports.length,
    newReports: reports.filter((r) => r.status === 'reported').length,
    pendingReports: reports.filter((r) => r.status === 'under_review').length,
    inProgressReports: reports.filter((r) => r.status === 'in_progress').length,
    resolvedReports: reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length,
    totalLocations: locations.length,
    qrScans: 247, // Mock value; in production, count from qrScans collection
    reportsThisWeek: reports.filter((r) => r.createdAt >= weekAgo).length,
  };
}

export function getReportsByCategory(reports: Report[]): { name: string; value: number; color: string }[] {
  const categoryCount: Record<string, number> = {};
  const categoryColors: Record<string, string> = {
    garbage: '#B45309',
    road: '#DC2626',
    trek: '#059669',
    network: '#7C3AED',
    water: '#2563EB',
    toilet: '#DB2777',
    lighting: '#D97706',
    signboard: '#0891B2',
    parking: '#4F46E5',
    infrastructure: '#64748B',
    safety: '#EF4444',
    other: '#6B7280',
  };

  reports.forEach((r) => {
    categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
  });

  return Object.entries(categoryCount).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: categoryColors[key] || '#6B7280',
  }));
}

export function getReportsByLocation(reports: Report[]): { name: string; value: number }[] {
  const locationCount: Record<string, number> = {};
  reports.forEach((r) => {
    locationCount[r.locationName] = (locationCount[r.locationName] || 0) + 1;
  });

  return Object.entries(locationCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getReportsByStatus(reports: Report[]): { name: string; value: number; color: string }[] {
  const statusColors: Record<string, string> = {
    reported: '#F59E0B',
    under_review: '#3B82F6',
    in_progress: '#F97316',
    resolved: '#10B981',
    closed: '#9CA3AF',
  };
  const statusLabels: Record<string, string> = {
    reported: 'Reported',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  const statusCount: Record<string, number> = {};
  reports.forEach((r) => {
    statusCount[r.status] = (statusCount[r.status] || 0) + 1;
  });

  return Object.entries(statusCount).map(([key, value]) => ({
    name: statusLabels[key] || key,
    value,
    color: statusColors[key] || '#6B7280',
  }));
}
