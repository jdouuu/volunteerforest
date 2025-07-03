export interface Notification {
  id: string;
  type: 'event_assignment' | 'event_update' | 'event_reminder' | 'system' | 'volunteer_match';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  urgent: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    eventId?: string;
    userId?: string;
    organizationId?: string;
  };
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  eventAssignments: boolean;
  eventUpdates: boolean;
  eventReminders: boolean;
  systemNotifications: boolean;
  volunteerMatches: boolean;
}

export type NotificationType = Notification['type'];