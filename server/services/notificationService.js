const nodemailer = require('nodemailer');
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // For development/testing, use ethereal email (fake SMTP)
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    } else {
      // Production email configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendEventAssignmentNotification(volunteerId, eventId) {
    try {
      const volunteer = await Volunteer.findById(volunteerId);
      const event = await Event.findById(eventId);

      if (!volunteer || !event) {
        throw new Error('Volunteer or Event not found');
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@volunteerforest.org',
        to: volunteer.email,
        subject: `Event Assignment: ${event.title}`,
        html: `
          <h2>You've been assigned to an event!</h2>
          <p>Dear ${volunteer.name},</p>
          <p>You have been assigned to the following event:</p>
          <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
            <h3>${event.title}</h3>
            <p><strong>Description:</strong> ${event.description}</p>
            <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${event.duration} hours</p>
            <p><strong>Location:</strong> ${event.location.address || 'TBD'}</p>
          </div>
          <p>Thank you for volunteering!</p>
          <p>Best regards,<br>VolunteerForest Team</p>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Event assignment notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending event assignment notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendEventUpdateNotification(eventId, updateMessage) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // In a real implementation, you'd get volunteers assigned to this event
      // For now, we'll simulate getting volunteers interested in this event type
      const volunteers = await Volunteer.find({
        preferences: event.eventType,
        isActive: true
      }).limit(10);

      const notifications = [];
      
      for (const volunteer of volunteers) {
        const mailOptions = {
          from: process.env.FROM_EMAIL || 'noreply@volunteerforest.org',
          to: volunteer.email,
          subject: `Event Update: ${event.title}`,
          html: `
            <h2>Event Update</h2>
            <p>Dear ${volunteer.name},</p>
            <p>There's an update regarding the event: <strong>${event.title}</strong></p>
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
              <p><strong>Update:</strong> ${updateMessage}</p>
              <p><strong>Event Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
              <p><strong>Location:</strong> ${event.location.address || 'TBD'}</p>
            </div>
            <p>Thank you for your continued interest!</p>
            <p>Best regards,<br>VolunteerForest Team</p>
          `
        };

        const result = await this.transporter.sendMail(mailOptions);
        notifications.push({
          volunteerId: volunteer._id,
          email: volunteer.email,
          messageId: result.messageId
        });
      }

      return {
        success: true,
        notificationsSent: notifications.length,
        notifications
      };
    } catch (error) {
      console.error('Error sending event update notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendEventReminderNotification(eventId, reminderType = 'day_before') {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Get volunteers who might be interested (in real app, get registered volunteers)
      const volunteers = await Volunteer.find({
        preferences: event.eventType,
        isActive: true
      }).limit(5);

      const reminderMessages = {
        day_before: 'Reminder: Your volunteer event is tomorrow!',
        hour_before: 'Reminder: Your volunteer event starts in 1 hour!',
        week_before: 'Reminder: Your volunteer event is next week!'
      };

      const notifications = [];

      for (const volunteer of volunteers) {
        const mailOptions = {
          from: process.env.FROM_EMAIL || 'noreply@volunteerforest.org',
          to: volunteer.email,
          subject: `Reminder: ${event.title}`,
          html: `
            <h2>${reminderMessages[reminderType]}</h2>
            <p>Dear ${volunteer.name},</p>
            <p>This is a friendly reminder about your upcoming volunteer event:</p>
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
              <h3>${event.title}</h3>
              <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()}</p>
              <p><strong>Duration:</strong> ${event.duration} hours</p>
              <p><strong>Location:</strong> ${event.location.address || 'TBD'}</p>
            </div>
            <p>We look forward to seeing you there!</p>
            <p>Best regards,<br>VolunteerForest Team</p>
          `
        };

        const result = await this.transporter.sendMail(mailOptions);
        notifications.push({
          volunteerId: volunteer._id,
          email: volunteer.email,
          messageId: result.messageId
        });
      }

      return {
        success: true,
        reminderType,
        notificationsSent: notifications.length,
        notifications
      };
    } catch (error) {
      console.error('Error sending event reminder notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendWelcomeNotification(volunteerId) {
    try {
      const volunteer = await Volunteer.findById(volunteerId);
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@volunteerforest.org',
        to: volunteer.email,
        subject: 'Welcome to VolunteerForest!',
        html: `
          <h2>Welcome to VolunteerForest!</h2>
          <p>Dear ${volunteer.name},</p>
          <p>Thank you for joining VolunteerForest! We're excited to have you as part of our community.</p>
          <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
            <h3>Getting Started:</h3>
            <ul>
              <li>Complete your profile to get better event matches</li>
              <li>Set your availability and preferences</li>
              <li>Browse available volunteer opportunities</li>
              <li>Start making a difference in your community!</li>
            </ul>
          </div>
          <p>If you have any questions, feel free to reach out to us.</p>
          <p>Happy volunteering!<br>VolunteerForest Team</p>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Welcome notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getNotificationHistory(volunteerId, limit = 20) {
    // In a real app, you'd store notification history in the database
    // For now, return mock data
    return {
      success: true,
      notifications: [
        {
          id: '1',
          type: 'event_assignment',
          subject: 'Event Assignment: Community Garden Cleanup',
          sentAt: new Date(),
          status: 'sent'
        },
        {
          id: '2',
          type: 'reminder',
          subject: 'Reminder: Community Garden Cleanup',
          sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'sent'
        }
      ]
    };
  }

  async testEmailConfiguration() {
    try {
      const testResult = await this.transporter.verify();
      return {
        success: true,
        message: 'Email configuration is valid',
        details: testResult
      };
    } catch (error) {
      return {
        success: false,
        message: 'Email configuration failed',
        error: error.message
      };
    }
  }
}

module.exports = new NotificationService();