export type IncidentCategory =
  | 'Pothole'
  | 'Road Damage'
  | 'Accident'
  | 'Waterlogging'
  | 'Traffic Signal Failure'
  | 'Road Blockage'
  | 'Fallen Tree'
  | 'Other Road Hazard'
  | 'Traffic Congestion'
  | 'Public Transport Delay'
  | 'Damaged Road'
  | 'Footpath / Accessibility'
  | 'Damaged Traffic Signal'
  | 'Waterlogging / Flooding'
  | 'Other';

export type IncidentPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened'
  | 'Reported'; // legacy support

export interface ReporterInfo {
  name: string;
  phone?: string;
  email?: string;
  isAnonymous?: boolean;
}

export interface Incident {
  id: string; // e.g. MS-2026-101
  trackingId?: string; // e.g. MS-TRK-10101
  title: string;
  category: IncidentCategory;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  priority: IncidentPriority;
  status: IncidentStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  reporter: ReporterInfo;
  reporterUserId?: string;
  estimatedImpact?: string;
  assignedUnit?: string;
  adminNotes?: string;
  publicUpdate?: string;
  photoUrl?: string;
  incidentDate?: string;
  perceivedUrgency?: string;
}

export interface IncidentFilters {
  searchQuery: string;
  category: string;
  priority: string;
  status: string;
  sortBy: 'newest' | 'oldest' | 'priority' | 'category';
}

export interface IncidentStatistics {
  total: number;
  reported: number; // or submitted
  underReview?: number;
  verified?: number;
  inProgress: number;
  resolved: number;
  criticalOrHighOpen: number;
  resolutionRate: number;
}
