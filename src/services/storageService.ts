import { Incident, IncidentStatistics, IncidentStatus, IncidentPriority } from '../types/incident';
import { ActivityLog } from '../types/activity';
import { SEED_INCIDENTS } from '../data/seedIncidents';

const STORAGE_KEY_INCIDENTS = 'movesmart_incidents_v1';
const STORAGE_KEY_ACTIVITIES = 'movesmart_activities_v1';

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'ACT-INIT-01',
    type: 'INCIDENT_SUBMITTED',
    incidentId: 'MS-2026-101',
    title: 'Multi-Vehicle Collision near BKC',
    description: 'Reported by citizen Vikram Mehta with Critical severity',
    timestamp: '2026-10-27T08:15:00.000Z',
    actor: 'Citizen (Vikram Mehta)',
  },
  {
    id: 'ACT-INIT-02',
    type: 'STATUS_UPDATED',
    incidentId: 'MS-2026-101',
    title: 'Status changed to In Progress',
    description: 'Assigned to Traffic Division 3 - BKC Rapid Response',
    timestamp: '2026-10-27T08:45:00.000Z',
    actor: 'Admin (Control Room 04)',
    previousValue: 'Reported',
    newValue: 'In Progress',
  },
  {
    id: 'ACT-INIT-03',
    type: 'INCIDENT_RESOLVED',
    incidentId: 'MS-2026-109',
    title: 'Broken Storm Drain Grate Resolved',
    description: 'MCGM A-Ward Civil Works installed replacement ductile grate',
    timestamp: '2026-10-27T08:00:00.000Z',
    actor: 'Admin (Ward Engineer)',
    previousValue: 'In Progress',
    newValue: 'Resolved',
  },
  {
    id: 'ACT-INIT-04',
    type: 'INCIDENT_RESOLVED',
    incidentId: 'MS-2026-110',
    title: 'Sea Link Toll Lane 4 Cleared',
    description: 'FASTag sensor recalibrated and operational',
    timestamp: '2026-10-27T07:10:00.000Z',
    actor: 'Admin (MSRDC Control)',
    previousValue: 'In Progress',
    newValue: 'Resolved',
  },
];

export const storageService = {
  // --- INCIDENTS ---
  getIncidents(): Incident[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      if (!stored) {
        // Seed initial data
        this.saveIncidents(SEED_INCIDENTS);
        return SEED_INCIDENTS;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return SEED_INCIDENTS;
    } catch (e) {
      console.error('Failed to load incidents from localStorage, using fallback seed data', e);
      return SEED_INCIDENTS;
    }
  },

  saveIncidents(incidents: Incident[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.error('Failed to save incidents to localStorage', e);
    }
  },

  getIncidentById(idOrTrackingId: string): Incident | undefined {
    const q = idOrTrackingId.trim().toLowerCase();
    const incidents = this.getIncidents();
    return incidents.find(
      (inc) => inc.id.toLowerCase() === q || (inc.trackingId && inc.trackingId.toLowerCase() === q)
    );
  },

  createIncident(data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Incident {
    const incidents = this.getIncidents();
    const currentYear = new Date().getFullYear();
    
    // Find highest existing numerical suffix in MS-YYYY-XXX to ensure strictly sequential, unique IDs
    const existingNumbers = incidents
      .map((i) => {
        const match = i.id.match(/^MS-\d{4}-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    let nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 101;
    let newId = `MS-${currentYear}-${nextNumber}`;

    // Extra collision guard against any edge cases
    const existingIdSet = new Set(incidents.map((i) => i.id.toLowerCase()));
    while (existingIdSet.has(newId.toLowerCase())) {
      nextNumber++;
      newId = `MS-${currentYear}-${nextNumber}`;
    }

    const now = new Date().toISOString();
    const trackingId = data.trackingId || `MS-TRK-${10000 + Math.floor(Math.random() * 90000)}`;

    const newIncident: Incident = {
      ...data,
      id: newId,
      trackingId,
      status: data.status || 'Submitted',
      publicUpdate: data.publicUpdate || 'Complaint registered in operations queue and awaiting verification.',
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [newIncident, ...incidents];
    this.saveIncidents(updatedList);

    this.addActivity({
      id: `ACT-${Date.now()}`,
      type: 'INCIDENT_SUBMITTED',
      incidentId: newIncident.id,
      title: `New Incident Reported: ${newIncident.title}`,
      description: `Category: ${newIncident.category} | Priority: ${newIncident.priority} | Location: ${newIncident.location}`,
      timestamp: now,
      actor: newIncident.reporter?.name ? `Citizen (${newIncident.reporter.name})` : 'Anonymous Citizen',
      newValue: newIncident.status,
    });

    return newIncident;
  },

  updateIncident(id: string, updates: Partial<Incident>): Incident | null {
    const incidents = this.getIncidents();
    const index = incidents.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const existing = incidents[index];
    const now = new Date().toISOString();

    const updatedIncident: Incident = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      createdAt: existing.createdAt, // Immutable creation timestamp
      updatedAt: now,
    };

    incidents[index] = updatedIncident;
    this.saveIncidents(incidents);

    this.addActivity({
      id: `ACT-${Date.now()}`,
      type: 'INCIDENT_EDITED',
      incidentId: id,
      title: `Incident Updated: ${updatedIncident.title}`,
      description: `Administrative update applied to incident details`,
      timestamp: now,
      actor: 'Admin (Operations)',
    });

    return updatedIncident;
  },

  updateIncidentStatus(
    id: string,
    newStatus: IncidentStatus,
    adminNote?: string,
    publicUpdate?: string,
    assignedUnit?: string,
    priority?: IncidentPriority
  ): Incident | null {
    const incidents = this.getIncidents();
    const index = incidents.findIndex((i) => i.id === id || (i.trackingId && i.trackingId.toLowerCase() === id.toLowerCase()));
    if (index === -1) return null;

    const existing = incidents[index];
    const prevStatus = existing.status;
    const now = new Date().toISOString();

    const updatedIncident: Incident = {
      ...existing,
      status: newStatus,
      updatedAt: now,
      adminNotes: adminNote ? `${existing.adminNotes ? existing.adminNotes + ' | ' : ''}${adminNote}` : existing.adminNotes,
      publicUpdate: publicUpdate !== undefined ? publicUpdate : existing.publicUpdate,
      assignedUnit: assignedUnit !== undefined ? assignedUnit : existing.assignedUnit,
      priority: priority !== undefined ? priority : existing.priority,
    };

    incidents[index] = updatedIncident;
    this.saveIncidents(incidents);

    const isResolved = newStatus === 'Resolved';
    this.addActivity({
      id: `ACT-${Date.now()}`,
      type: isResolved ? 'INCIDENT_RESOLVED' : 'STATUS_UPDATED',
      incidentId: updatedIncident.id,
      title: `Status changed to ${newStatus}: ${updatedIncident.title}`,
      description: adminNote || publicUpdate ? `Admin Note: ${adminNote || 'None'} | Public Update: ${publicUpdate || 'None'}` : `Status transitioned from ${prevStatus} to ${newStatus}`,
      timestamp: now,
      actor: 'Admin (Operations)',
      previousValue: prevStatus,
      newValue: newStatus,
    });

    return updatedIncident;
  },

  deleteIncident(id: string): boolean {
    const incidents = this.getIncidents();
    const target = incidents.find((i) => i.id === id);
    if (!target) return false;

    const filtered = incidents.filter((i) => i.id !== id);
    this.saveIncidents(filtered);

    this.addActivity({
      id: `ACT-${Date.now()}`,
      type: 'INCIDENT_DELETED',
      incidentId: id,
      title: `Incident Deleted: ${target.title} (${id})`,
      description: `Permanently removed from active operations log by admin`,
      timestamp: new Date().toISOString(),
      actor: 'Admin (Supervisor)',
    });

    return true;
  },

  resetToDemoData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_INCIDENTS);
      localStorage.removeItem(STORAGE_KEY_ACTIVITIES);
      this.saveIncidents(SEED_INCIDENTS);
      this.saveActivities(INITIAL_ACTIVITIES);

      this.addActivity({
        id: `ACT-${Date.now()}`,
        type: 'DEMO_DATA_RESET',
        title: 'Demo Environment Reset',
        description: 'All prototype data was restored to default Mumbai sample incidents.',
        timestamp: new Date().toISOString(),
        actor: 'System Admin',
      });
    } catch (e) {
      console.error('Failed to reset demo data', e);
    }
  },

  // --- ACTIVITIES ---
  getActivities(): ActivityLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (!stored) {
        this.saveActivities(INITIAL_ACTIVITIES);
        return INITIAL_ACTIVITIES;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : INITIAL_ACTIVITIES;
    } catch (e) {
      console.error('Failed to load activities', e);
      return INITIAL_ACTIVITIES;
    }
  },

  saveActivities(activities: ActivityLog[]): void {
    try {
      // Keep most recent 100 activities
      const trimmed = activities.slice(0, 100);
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save activities', e);
    }
  },

  addActivity(activity: ActivityLog): void {
    const current = this.getActivities();
    const updated = [activity, ...current];
    this.saveActivities(updated);
  },

  // --- STATISTICS ---
  computeStatistics(incidents: Incident[]): IncidentStatistics {
    const total = incidents.length;
    let reported = 0;
    let underReview = 0;
    let verified = 0;
    let inProgress = 0;
    let resolved = 0;
    let criticalOrHighOpen = 0;

    for (const inc of incidents) {
      const s = inc.status;
      if (s === 'Reported' || s === 'Submitted') reported++;
      else if (s === 'Under Review') underReview++;
      else if (s === 'Verified') verified++;
      else if (s === 'In Progress' || s === 'Assigned') inProgress++;
      else if (s === 'Resolved') resolved++;

      if (s !== 'Resolved' && s !== 'Rejected' && (inc.priority === 'High' || inc.priority === 'Critical')) {
        criticalOrHighOpen++;
      }
    }

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      reported,
      underReview,
      verified,
      inProgress,
      resolved,
      criticalOrHighOpen,
      resolutionRate,
    };
  },
};
