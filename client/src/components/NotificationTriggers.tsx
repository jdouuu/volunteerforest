import { FC, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { notificationApiService } from '../services/notificationService';

interface NotificationTriggersProps {
  userRole?: string;
  currentUserId?: string;
}

const NotificationTriggers: FC<NotificationTriggersProps> = ({ 
  userRole = 'volunteer', 
  currentUserId = '507f1f77bcf86cd799439011' 
}) => {
  const { 
    triggerEventAssignment, 
    triggerEventUpdate, 
    triggerEventReminder, 
    triggerVolunteerMatch 
  } = useNotifications();
  
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [results, setResults] = useState<{ [key: string]: any }>({});

  const handleApiCall = async (action: string, apiCall: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [action]: true }));
    try {
      const result = await apiCall();
      setResults(prev => ({ ...prev, [action]: result }));
      console.log(`${action} result:`, result);
    } catch (error) {
      console.error(`${action} error:`, error);
      setResults(prev => ({ ...prev, [action]: { error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  const handleTriggerAssignment = () => {
    triggerEventAssignment('Community Garden Cleanup', 'demo-event-1');
    
    // Also test the API
    handleApiCall('assignment', () => 
      notificationApiService.sendEventAssignment(currentUserId, '507f1f77bcf86cd799439012')
    );
  };

  const handleTriggerUpdate = () => {
    triggerEventUpdate('Beach Cleanup', 'demo-event-2', 'Event time has been changed to 10 AM due to weather conditions.');
    
    // Also test the API (admin only)
    if (userRole === 'admin') {
      handleApiCall('update', () => 
        notificationApiService.sendEventUpdate('507f1f77bcf86cd799439012', 'Event time has been changed to 10 AM due to weather conditions.')
      );
    }
  };

  const handleTriggerReminder = () => {
    triggerEventReminder('Food Bank Volunteer', 'demo-event-3', 'in 2 hours');
    
    // Also test the API (admin only)
    if (userRole === 'admin') {
      handleApiCall('reminder', () => 
        notificationApiService.sendEventReminder('507f1f77bcf86cd799439012', 'day_before')
      );
    }
  };

  const handleTriggerMatch = () => {
    triggerVolunteerMatch('Senior Center Technology Help', 'demo-event-4');
  };

  const handleWelcomeNotification = () => {
    handleApiCall('welcome', () => 
      notificationApiService.sendWelcome(currentUserId)
    );
  };

  const handleTestEmailConfig = () => {
    if (userRole === 'admin') {
      handleApiCall('testConfig', () => 
        notificationApiService.testEmailConfig()
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notification Demo</h2>
      <p className="text-gray-600 mb-6">
        Click the buttons below to trigger different types of notifications and see how they appear in the notification dropdown and as toast messages.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={handleTriggerAssignment}
          disabled={loading.assignment}
          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <span className="mr-2">📝</span>
          {loading.assignment ? 'Sending...' : 'Event Assignment'}
        </button>
        
        <button
          onClick={handleTriggerUpdate}
          disabled={loading.update}
          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <span className="mr-2">🔄</span>
          {loading.update ? 'Sending...' : 'Event Update'}
          {userRole !== 'admin' && <span className="ml-1 text-xs">(UI only)</span>}
        </button>
        
        <button
          onClick={handleTriggerReminder}
          disabled={loading.reminder}
          className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <span className="mr-2">⏰</span>
          {loading.reminder ? 'Sending...' : 'Event Reminder'}
          {userRole !== 'admin' && <span className="ml-1 text-xs">(UI only)</span>}
        </button>
        
        <button
          onClick={handleTriggerMatch}
          className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <span className="mr-2">🤝</span>
          Volunteer Match
        </button>

        <button
          onClick={handleWelcomeNotification}
          disabled={loading.welcome}
          className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <span className="mr-2">👋</span>
          {loading.welcome ? 'Sending...' : 'Welcome Email'}
        </button>

        {userRole === 'admin' && (
          <button
            onClick={handleTestEmailConfig}
            disabled={loading.testConfig}
            className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <span className="mr-2">⚙️</span>
            {loading.testConfig ? 'Testing...' : 'Test Email Config'}
          </button>
        )}
      </div>

      {/* API Results */}
      {Object.keys(results).length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-medium text-gray-900">API Results:</h3>
          {Object.entries(results).map(([action, result]) => (
            <div key={action} className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-start justify-between">
                <span className="font-medium text-sm text-gray-700 capitalize">{action}:</span>
                <button
                  onClick={() => setResults(prev => {
                    const { [action]: _, ...rest } = prev;
                    return rest;
                  })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <pre className="mt-1 text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
      
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