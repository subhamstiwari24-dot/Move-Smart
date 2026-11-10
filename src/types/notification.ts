export type NotificationType =
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'STATUS_UPDATED'
  | 'INFO_REQUESTED'
  | 'RESOLVED';

export interface NotificationItem {
  id: string;
  userId: string;
  incidentId?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
