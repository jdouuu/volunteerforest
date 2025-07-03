import { FC } from 'react';
import { NotificationPreferences } from '../types/notifications';

interface NotificationPreferencesProps {
  preferences: NotificationPreferences;
  onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => void;
}

const NotificationPreferencesComponent: FC<NotificationPreferencesProps> = ({
  preferences,
  onUpdatePreferences
}) => {
  const handleToggle = (key: keyof NotificationPreferences) => {
    onUpdatePreferences({ [key]: !preferences[key] });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <button
                onClick={() => handleToggle('email')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.email ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    preferences.email ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                <p className="text-sm text-gray-500">Receive notifications via text message</p>
              </div>
              <button
                onClick={() => handleToggle('sms')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.sms ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    preferences.sms ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-sm text-gray-500">Receive notifications in your browser</p>
              </div>
              <button
                onClick={() => handleToggle('push')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.push ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    preferences.push ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Event Assignments</label>
                <p className="text-sm text-gray-500">When you're assigned to volunteer for an event</p>
              </div>
              <button
                onClick={() => handleToggle('eventAssignments')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.eventAssignments ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    preferences.eventAssignments ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Event Updates</label>
                <p className="text-sm text-gray-500">When events you're involved in are updated</p>
              </div>
              <button
                onClick={() => handleToggle('eventUpdates')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.eventUpdates ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    preferences.eventUpdates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Event Reminders</label>
                <p className="text-sm text-gray-500">Reminders about upcoming events</p>
              </div>
              <button
                onClick={() => handleToggle('eventReminders')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.eventReminders ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    preferences.eventReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Volunteer Matches</label>
                <p className="text-sm text-gray-500">When we find opportunities that match your skills</p>
              </div>
              <button
                onClick={() => handleToggle('volunteerMatches')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.volunteerMatches ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    preferences.volunteerMatches ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">System Notifications</label>
                <p className="text-sm text-gray-500">Important system updates and announcements</p>
              </div>
              <button
                onClick={() => handleToggle('systemNotifications')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.systemNotifications ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    preferences.systemNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-blue-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Email and SMS notifications will be available once you connect your backend services. 
                For now, notifications will only appear in the application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesComponent;