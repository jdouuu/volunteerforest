// API service for notifications
const API_BASE_URL = `/api`;

export interface NotificationRequest {
  volunteerId: string;
  eventId?: string;
  updateMessage?: string;
  reminderType?: 'day_before' | 'hour_before' | 'week_before';
}

export interface NotificationHistory {
  id: string;
  type: string;
  subject: string;
  sentAt: Date;
  status: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  eventAssignments: boolean;
  eventUpdates: boolean;
  eventReminders: boolean;
  weeklyDigest: boolean;
  smsNotifications: boolean;
}

class NotificationApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Send event assignment notification
  async sendEventAssignment(volunteerId: string, eventId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/event-assignment`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ volunteerId, eventId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending event assignment notification:', error);
      throw error;
    }
  }

  // Send event update notification
  async sendEventUpdate(eventId: string, updateMessage: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/event-update`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ eventId, updateMessage })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending event update notification:', error);
      throw error;
    }
  }

  // Send event reminder notification
  async sendEventReminder(eventId: string, reminderType: string = 'day_before'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/event-reminder`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ eventId, reminderType })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending event reminder notification:', error);
      throw error;
    }
  }

  // Send welcome notification
  async sendWelcome(volunteerId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/welcome`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ volunteerId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      throw error;
    }
  }

  // Get notification history
  async getNotificationHistory(volunteerId: string, limit: number = 20): Promise<NotificationHistory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/history/${volunteerId}?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching notification history:', error);
      throw error;
    }
  }

  // Get notification preferences
  async getNotificationPreferences(volunteerId: string): Promise<NotificationPreferences> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences/${volunteerId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(volunteerId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences/${volunteerId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Test email configuration (admin only)
  async testEmailConfig(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/test-config`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing email configuration:', error);
      throw error;
    }
  }
}

export const notificationApiService = new NotificationApiService();
