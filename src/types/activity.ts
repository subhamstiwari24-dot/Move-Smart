export type ActivityActionType =
  | 'INCIDENT_SUBMITTED'
  | 'STATUS_UPDATED'
  | 'INCIDENT_EDITED'
  | 'INCIDENT_RESOLVED'
  | 'INCIDENT_DELETED'
  | 'DEMO_DATA_RESET';

export interface ActivityLog {
  id: string;
  type: ActivityActionType;
  incidentId?: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  previousValue?: string;
  newValue?: string;
}
