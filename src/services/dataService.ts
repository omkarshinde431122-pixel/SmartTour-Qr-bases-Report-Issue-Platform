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
// MOCK DATA & STORAGE SYNCHRONIZATION
// ============================================================================

const STORAGE_KEY_REPORTS = 'smarttour_local_reports';
const STORAGE_KEY_LOCATIONS = 'smarttour_local_locations';

const INITIAL_MOCK_LOCATIONS: TouristLocation[] = SAMPLE_LOCATIONS.map((loc, idx) => ({
  ...loc,
  id: `loc-${idx + 1}`,
  images: [],
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-08-01'),
}));

const INITIAL_MOCK_REPORTS: Report[] = [
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
    adminNotes: ['Field team dispatched to inspect road depression and place temporary warning barricades.'],
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
    adminNotes: ['Assigned to Forestry division for route re-marking and directional board installation.'],
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
    adminNotes: ['New neon high-visibility trail markers installed along the entire 5.2 km stretch.'],
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
    adminNotes: ['Water testing sample collected. Warning board placed advising tourists not to consume water.'],
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
    adminNotes: ['Additional overflow parking lot opened 200m before main viewpoint.'],
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
    title: 'No mobile network after 1st kilometer',
    description: 'Airtel and Jio signals completely drop after passing the first viewpoint. In case of emergency there is no way to call for help.',
    imageUrls: [],
    imageRefs: [],
    status: 'under_review',
    priority: 'high',
    adminNotes: ['Emergency Wi-Fi SOS hotspot installation under review with local telecom authorities.'],
    networkProvider: 'Jio / Airtel',
    networkIssueType: 'no_network',
    createdAt: new Date('2026-08-05T08:00:00'),
    updatedAt: new Date('2026-08-05T08:00:00'),
  },
  {
    id: 'rpt-10',
    reportId: 'ST-2026-100010',
    locationId: 'loc-3',
    locationName: 'Bopdev Ghat Viewpoint',
    category: 'lighting',
    title: 'Solar lights not working during evening hours',
    description: 'Two solar streetlights installed along the viewpoint pathway are non-functional. The area is completely dark after 6:30 PM creating security risks.',
    imageUrls: [],
    imageRefs: [],
    status: 'in_progress',
    priority: 'medium',
    adminNotes: ['Solar battery replacement requisition submitted to municipal contractor.'],
    createdAt: new Date('2026-08-05T14:30:00'),
    updatedAt: new Date('2026-08-06T09:15:00'),
  },
];

// Helper to revive dates from JSON
function reviveReport(r: any): Report {
  return {
    ...r,
    createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
    updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
    resolvedAt: r.resolvedAt ? new Date(r.resolvedAt) : undefined,
    adminNotes: Array.isArray(r.adminNotes) ? r.adminNotes : [],
  };
}

function reviveLocation(l: any): TouristLocation {
  return {
    ...l,
    createdAt: l.createdAt ? new Date(l.createdAt) : new Date(),
    updatedAt: l.updatedAt ? new Date(l.updatedAt) : new Date(),
  };
}

function loadReportsFromStorage(): Report[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(reviveReport);
      }
    }
  } catch (e) {
    console.warn('Failed to load reports from localStorage', e);
  }
  // Initialize storage with defaults
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_MOCK_REPORTS));
  } catch (e) {}
  return [...INITIAL_MOCK_REPORTS];
}

function loadLocationsFromStorage(): TouristLocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(reviveLocation);
      }
    }
  } catch (e) {
    console.warn('Failed to load locations from localStorage', e);
  }
  try {
    localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(INITIAL_MOCK_LOCATIONS));
  } catch (e) {}
  return [...INITIAL_MOCK_LOCATIONS];
}

let mockLocations: TouristLocation[] = loadLocationsFromStorage();
let mockReports: Report[] = loadReportsFromStorage();

function saveReportsToStorage(reports: Report[]): void {
  mockReports = reports;
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smarttour_reports_updated', { detail: reports }));
    }
  } catch (e) {
    console.warn('Failed to save reports to localStorage', e);
  }
}

function saveLocationsToStorage(locations: TouristLocation[]): void {
  mockLocations = locations;
  try {
    localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(locations));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smarttour_locations_updated', { detail: locations }));
    }
  } catch (e) {
    console.warn('Failed to save locations to localStorage', e);
  }
}

// Cross-tab storage event listener
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_REPORTS) {
      mockReports = loadReportsFromStorage();
      window.dispatchEvent(new CustomEvent('smarttour_reports_updated', { detail: mockReports }));
    } else if (e.key === STORAGE_KEY_LOCATIONS) {
      mockLocations = loadLocationsFromStorage();
      window.dispatchEvent(new CustomEvent('smarttour_locations_updated', { detail: mockLocations }));
    }
  });
}

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
  const normSlug = slug.trim().toLowerCase();
  if (!isFirebaseConfigured || !db) {
    return mockLocations.find((l) => l.slug.toLowerCase() === normSlug || l.id.toLowerCase() === normSlug) || null;
  }

  try {
    const q1 = query(collection(db, 'locations'), where('slug', '==', slug), limit(1));
    let snapshot = await getDocs(q1);

    if (snapshot.empty) {
      const q2 = query(collection(db, 'locations'), where('slug', '==', normSlug), limit(1));
      snapshot = await getDocs(q2);
    }

    if (snapshot.empty) {
      const fallback = mockLocations.find((l) => l.slug.toLowerCase() === normSlug || l.id.toLowerCase() === normSlug);
      return fallback || null;
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
    return mockLocations.find((l) => l.slug.toLowerCase() === normSlug || l.id.toLowerCase() === normSlug) || null;
  }
}

export async function getLocationById(id: string): Promise<TouristLocation | null> {
  if (!isFirebaseConfigured || !db) {
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
  if (!isFirebaseConfigured || !db) {
    const currentLocs = loadLocationsFromStorage();
    const newId = `loc-${currentLocs.length + 1}`;
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
    const updated = [...currentLocs, newLoc];
    saveLocationsToStorage(updated);
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
  const currentLocs = loadLocationsFromStorage();
  const updated = currentLocs.map((l) =>
    l.id === id ? { ...l, ...data, updatedAt: new Date() } : l
  );
  saveLocationsToStorage(updated);

  if (!isFirebaseConfigured || !db) return;

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
  const localReports = loadReportsFromStorage();
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
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt ? (doc.data().resolvedAt as Timestamp)?.toDate() : undefined,
      })) as Report[];
    } catch (err) {
      console.warn('Firestore getReports failed (using local data):', err);
    }
  }

  // Unified merge: Keep local updates so admin changes are NEVER lost on refresh
  const map = new Map<string, Report>();
  localReports.forEach((r) => {
    const key = (r.reportId || r.id).trim().toUpperCase();
    map.set(key, r);
  });

  reportsList.forEach((remote) => {
    const key = (remote.reportId || remote.id).trim().toUpperCase();
    const existingLocal = map.get(key);
    if (!existingLocal) {
      map.set(key, remote);
    } else {
      const localTime = existingLocal.updatedAt instanceof Date ? existingLocal.updatedAt.getTime() : new Date(existingLocal.updatedAt || 0).getTime();
      const remoteTime = remote.updatedAt instanceof Date ? remote.updatedAt.getTime() : new Date(remote.updatedAt || 0).getTime();

      // If local status or adminNotes were modified, preserve them
      if (
        localTime >= remoteTime ||
        (existingLocal.status !== 'reported' && remote.status === 'reported') ||
        (existingLocal.adminNotes?.length || 0) > (remote.adminNotes?.length || 0)
      ) {
        map.set(key, {
          ...remote,
          ...existingLocal,
          id: existingLocal.id || remote.id,
          reportId: existingLocal.reportId || remote.reportId,
          status: existingLocal.status,
          adminNotes: existingLocal.adminNotes && existingLocal.adminNotes.length > 0 ? existingLocal.adminNotes : (remote.adminNotes || []),
          updatedAt: new Date(Math.max(localTime, remoteTime)),
        });
      } else {
        map.set(key, remote);
      }
    }
  });

  let merged = Array.from(map.values());
  saveReportsToStorage(merged);

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
  const currentReports = loadReportsFromStorage();
  const newReport: Report = {
    id: `rpt-${currentReports.length + 1}`,
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
  const updated = [newReport, ...currentReports];
  saveReportsToStorage(updated);
  return reportId;
}

export async function getReportByReportId(reportId: string): Promise<Report | null> {
  const cleanId = (reportId || '').trim().toUpperCase();
  const currentReports = loadReportsFromStorage();
  const localReport = currentReports.find(
    (r) => (r.reportId && r.reportId.toUpperCase() === cleanId) || (r.id && r.id.toUpperCase() === cleanId)
  );

  if (isFirebaseConfigured && db) {
    try {
      // 1. Query by reportId field
      let q = query(collection(db, 'reports'), where('reportId', '==', cleanId), limit(1));
      let snapshot = await getDocs(q);

      // 2. Fallback to original search string
      if (snapshot.empty && cleanId !== reportId.trim()) {
        q = query(collection(db, 'reports'), where('reportId', '==', reportId.trim()), limit(1));
        snapshot = await getDocs(q);
      }

      // 3. Fallback to direct document ID check
      if (snapshot.empty) {
        const directDocRef = doc(db, 'reports', reportId.trim());
        const directSnap = await getDoc(directDocRef);
        if (directSnap.exists()) {
          const data = directSnap.data();
          const remoteData = {
            id: directSnap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
            resolvedAt: data.resolvedAt ? (data.resolvedAt as Timestamp)?.toDate() : undefined,
          } as Report;
          
          if (localReport && localReport.status !== 'reported' && remoteData.status === 'reported') {
            remoteData.status = localReport.status;
            remoteData.adminNotes = localReport.adminNotes || remoteData.adminNotes;
          }
          return remoteData;
        }
      }

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const remoteData = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: (docSnap.data().createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (docSnap.data().updatedAt as Timestamp)?.toDate() || new Date(),
          resolvedAt: docSnap.data().resolvedAt ? (docSnap.data().resolvedAt as Timestamp)?.toDate() : undefined,
        } as Report;

        if (localReport && localReport.status !== 'reported' && remoteData.status === 'reported') {
          remoteData.status = localReport.status;
          remoteData.adminNotes = localReport.adminNotes || remoteData.adminNotes;
        }

        // Keep local cache synced
        const idx = currentReports.findIndex((r) => r.reportId === remoteData.reportId || r.id === remoteData.id);
        if (idx !== -1) {
          currentReports[idx] = { ...remoteData, ...currentReports[idx], status: currentReports[idx].status || remoteData.status };
        } else {
          currentReports.unshift(remoteData);
        }
        saveReportsToStorage(currentReports);

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

// Helper function to resolve Firestore document reference by ID or reportId
async function findReportDocRef(idOrReportId: string) {
  if (!db) return null;
  const clean = (idOrReportId || '').trim();
  // Try direct document reference
  try {
    const directRef = doc(db, 'reports', clean);
    const snap = await getDoc(directRef);
    if (snap.exists()) {
      return { ref: directRef, snap };
    }
  } catch (e) {}

  // Query by reportId field
  try {
    const q = query(collection(db, 'reports'), where('reportId', '==', clean.toUpperCase()), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const firstDoc = querySnap.docs[0];
      return { ref: firstDoc.ref, snap: firstDoc };
    }
  } catch (e) {}

  return null;
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus
): Promise<void> {
  const now = new Date();
  const cleanId = (id || '').trim().toLowerCase();
  const currentReports = loadReportsFromStorage();
  const updatedReports = currentReports.map((r) => {
    const match =
      (r.id && r.id.toLowerCase() === cleanId) ||
      (r.reportId && r.reportId.toLowerCase() === cleanId);
    if (match) {
      return {
        ...r,
        status,
        updatedAt: now,
        resolvedAt: status === 'resolved' ? now : r.resolvedAt,
      };
    }
    return r;
  });
  saveReportsToStorage(updatedReports);

  if (!isFirebaseConfigured || !db) return;

  try {
    const target = await findReportDocRef(id);
    if (target) {
      const updates: Record<string, any> = {
        status,
        updatedAt: Timestamp.now(),
      };
      if (status === 'resolved') {
        updates.resolvedAt = Timestamp.now();
      }
      await updateDoc(target.ref, updates);
    } else {
      // Fallback direct update
      const updates: Record<string, any> = {
        status,
        updatedAt: Timestamp.now(),
      };
      if (status === 'resolved') {
        updates.resolvedAt = Timestamp.now();
      }
      await updateDoc(doc(db, 'reports', id), updates);
    }
  } catch (err) {
    console.warn('Firestore status update (saved locally):', err);
  }
}

export async function updateReportPriority(
  id: string,
  priority: ReportPriority
): Promise<void> {
  const cleanId = (id || '').trim().toLowerCase();
  const currentReports = loadReportsFromStorage();
  const updatedReports = currentReports.map((r) => {
    const match =
      (r.id && r.id.toLowerCase() === cleanId) ||
      (r.reportId && r.reportId.toLowerCase() === cleanId);
    if (match) {
      return { ...r, priority, updatedAt: new Date() };
    }
    return r;
  });
  saveReportsToStorage(updatedReports);

  if (!isFirebaseConfigured || !db) return;

  try {
    const target = await findReportDocRef(id);
    if (target) {
      await updateDoc(target.ref, {
        priority,
        updatedAt: Timestamp.now(),
      });
    } else {
      await updateDoc(doc(db, 'reports', id), {
        priority,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (err) {
    console.warn('Firestore priority update (saved locally):', err);
  }
}

export async function addAdminNote(id: string, note: string): Promise<void> {
  const cleanId = (id || '').trim().toLowerCase();
  const currentReports = loadReportsFromStorage();
  const updatedReports = currentReports.map((r) => {
    const match =
      (r.id && r.id.toLowerCase() === cleanId) ||
      (r.reportId && r.reportId.toLowerCase() === cleanId);
    if (match) {
      return {
        ...r,
        adminNotes: [...(r.adminNotes || []), note],
        updatedAt: new Date(),
      };
    }
    return r;
  });
  saveReportsToStorage(updatedReports);

  if (!isFirebaseConfigured || !db) return;

  try {
    const target = await findReportDocRef(id);
    if (target) {
      const currentNotes = target.snap.data()?.adminNotes || [];
      await updateDoc(target.ref, {
        adminNotes: [...currentNotes, note],
        updatedAt: Timestamp.now(),
      });
    } else {
      const docRef = doc(db, 'reports', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentNotes = docSnap.data().adminNotes || [];
        await updateDoc(docRef, {
          adminNotes: [...currentNotes, note],
          updatedAt: Timestamp.now(),
        });
      }
    }
  } catch (err) {
    console.warn('Firestore note update (saved locally):', err);
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
