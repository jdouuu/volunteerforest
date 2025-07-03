import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Notification, NotificationPreferences } from '../types/notifications';

interface NotificationContextType {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  triggerEventAssignment: (eventName: string, eventId: string) => void;
  triggerEventUpdate: (eventName: string, eventId: string, updateMessage: string) => void;
  triggerEventReminder: (eventName: string, eventId: string, reminderTime: string) => void;
  triggerVolunteerMatch: (eventName: string, eventId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: true,
    eventAssignments: true,
    eventUpdates: true,
    eventReminders: true,
    systemNotifications: true,
    volunteerMatches: true,
  });

  useEffect(() => {
    // Initialize with some sample notifications
    const initialNotifications: Notification[] = [
      {
        id: 'init-1',
        type: 'system',
        title: 'Welcome to VolunteerForest!',
        message: 'Complete your profile to get better volunteer matches.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
        urgent: false,
        actionUrl: '/profile',
        actionLabel: 'Complete Profile'
      }
    ];
    setNotifications(initialNotifications);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  const triggerEventAssignment = useCallback((eventName: string, eventId: string) => {
    if (preferences.eventAssignments) {
      addNotification({
        type: 'event_assignment',
        title: 'New Event Assignment',
        message: `You have been assigned to help with ${eventName}.`,
        read: false,
        urgent: false,
        actionUrl: '/events',
        actionLabel: 'View Event',
        metadata: { eventId }
      });
    }
  }, [preferences.eventAssignments, addNotification]);

  const triggerEventUpdate = useCallback((eventName: string, eventId: string, updateMessage: string) => {
    if (preferences.eventUpdates) {
      addNotification({
        type: 'event_update',
        title: 'Event Update',
        message: `${eventName}: ${updateMessage}`,
        read: false,
        urgent: false,
        actionUrl: '/events',
        actionLabel: 'View Changes',
        metadata: { eventId }
      });
    }
  }, [preferences.eventUpdates, addNotification]);

  const triggerEventReminder = useCallback((eventName: string, eventId: string, reminderTime: string) => {
    if (preferences.eventReminders) {
      addNotification({
        type: 'event_reminder',
        title: 'Event Reminder',
        message: `Don't forget: ${eventName} starts ${reminderTime}.`,
        read: false,
        urgent: true,
        actionUrl: '/events',
        actionLabel: 'View Details',
        metadata: { eventId }
      });
    }
  }, [preferences.eventReminders, addNotification]);

  const triggerVolunteerMatch = useCallback((eventName: string, eventId: string) => {
    if (preferences.volunteerMatches) {
      addNotification({
        type: 'volunteer_match',
        title: 'Perfect Match Found!',
        message: `We found a volunteering opportunity that matches your skills: ${eventName}.`,
        read: false,
        urgent: false,
        actionUrl: '/events',
        actionLabel: 'View Opportunity',
        metadata: { eventId }
      });
    }
  }, [preferences.volunteerMatches, addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    preferences,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updatePreferences,
    triggerEventAssignment,
    triggerEventUpdate,
    triggerEventReminder,
    triggerVolunteerMatch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};