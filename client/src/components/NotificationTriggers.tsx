import { FC } from 'react';
import { useNotifications } from '../context/NotificationContext';

const NotificationTriggers: FC = () => {
  const { 
    triggerEventAssignment, 
    triggerEventUpdate, 
    triggerEventReminder, 
    triggerVolunteerMatch 
  } = useNotifications();

  const handleTriggerAssignment = () => {
    triggerEventAssignment('Community Garden Cleanup', 'demo-event-1');
  };

  const handleTriggerUpdate = () => {
    triggerEventUpdate('Beach Cleanup', 'demo-event-2', 'Event time has been changed to 10 AM due to weather conditions.');
  };

  const handleTriggerReminder = () => {
    triggerEventReminder('Food Bank Volunteer', 'demo-event-3', 'in 2 hours');
  };

  const handleTriggerMatch = () => {
    triggerVolunteerMatch('Senior Center Technology Help', 'demo-event-4');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notification Demo</h2>
      <p className="text-gray-600 mb-6">
        Click the buttons below to trigger different types of notifications and see how they appear in the notification dropdown and as toast messages.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleTriggerAssignment}
          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <span className="mr-2">📝</span>
          Trigger Event Assignment
        </button>
        
        <button
          onClick={handleTriggerUpdate}
          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="mr-2">🔄</span>
          Trigger Event Update
        </button>
        
        <button
          onClick={handleTriggerReminder}
          className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          <span className="mr-2">⏰</span>
          Trigger Event Reminder
        </button>
        
        <button
          onClick={handleTriggerMatch}
          className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <span className="mr-2">🤝</span>
          Trigger Volunteer Match
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-info-circle text-blue-400"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> These notifications are for demonstration purposes. 
              In a real application, these would be triggered automatically by backend services 
              when actual events occur (like event creation, user registration, schedule changes, etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTriggers;