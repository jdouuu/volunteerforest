import React, { FC, useState, useEffect } from 'react';
import { Volunteer } from '../services/api';
import apiService, { MatchingStats, UrgentAlert, MatchingEvent } from '../services/api';

interface DashboardProps {
  user: Volunteer | null;
  onNavigate?: (page: 'dashboard' | 'profile' | 'events') => void;
}

const Dashboard: FC<DashboardProps> = ({ user, onNavigate }) => {
  const [stats, setStats] = useState<MatchingStats | null>(null);
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([]);
  const [matchingEvents, setMatchingEvents] = useState<MatchingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        if (user?.role === 'admin') {
          // Fetch admin data
          const [statsResponse, alertsResponse] = await Promise.all([
            apiService.getMatchingStats(),
            apiService.getUrgentAlerts()
          ]);
          
          if (statsResponse.success) setStats(statsResponse.data);
          if (alertsResponse.success) setUrgentAlerts(alertsResponse.data);
        } else {
          // Fetch volunteer data
          if (user?._id) {
            const eventsResponse = await apiService.getMatchingEvents(user._id, 5);
            if (eventsResponse.success) setMatchingEvents(eventsResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) return null;

  // Volunteer Dashboard Cards
  const volunteerCards = [
    // Stats/Welcome Card
    <div key="volunteer-stats" className="glass-card p-6 leaf-shape organic-shadow h-full flex flex-col justify-between min-h-[400px] min-w-[300px]">
        <h2 className="text-xl font-semibold text-green-700 mb-4">
          Welcome back, {user.name}!
        </h2>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-green-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Your profile is 65% complete.{' '}
                <button 
                  onClick={() => onNavigate?.('profile')}
                  className="font-medium text-green-700 hover:text-green-600"
                >
                  Complete it now
                </button>
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">Your volunteer score</p>
            <div className="flex items-center mt-1">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="ml-2 text-sm text-gray-600">65/100</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigate?.('profile')}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            View Profile
          </button>
        </div>
    </div>,
    // Upcoming Events Card
    <div key="volunteer-events" className="glass-card p-6 organic-shadow h-full flex flex-col justify-between min-h-[400px] min-w-[300px]">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-green-700">Recommended Events</h2>
          <button 
            onClick={() => onNavigate?.('events')}
            className="text-sm text-green-600 hover:text-green-500"
          >
            View all
          </button>
        </div>
        <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : matchingEvents.length > 0 ? (
          matchingEvents.slice(0, 2).map((matchingEvent, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
            <div className="flex justify-between">
                <h3 className="text-base font-medium text-gray-900">{matchingEvent.event.title}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {Math.round(matchingEvent.matchScore * 100)}% match
              </span>
            </div>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(matchingEvent.event.startDate).toLocaleDateString()} · {matchingEvent.event.duration}h
              </p>
              <p className="mt-1 text-sm text-gray-500">{matchingEvent.event.location.city}</p>
            <button 
              onClick={() => onNavigate?.('events')}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              View Details
            </button>
          </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <i className="fas fa-calendar-alt text-gray-400 text-2xl mb-2"></i>
            <p className="text-sm">No matching events found</p>
            <p className="text-xs">Update your profile to get better recommendations</p>
          </div>
        )}
      </div>
    </div>,
    // Recent Activity Card
    <div key="volunteer-activity" className="glass-card p-6 organic-shadow h-full flex flex-col justify-between min-h-[400px] min-w-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-green-700">Recent Activity</h2>
          <a href="#" className="text-sm text-green-600 hover:text-green-500">View all</a>
        </div>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">You volunteered at Riverside Cleanup</p>
              <p className="text-sm text-gray-500">June 3, 2023 · 4 hours</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">You signed up for Community Garden</p>
              <p className="text-sm text-gray-500">May 28, 2023</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
              <i className="fas fa-star text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">You earned the Green Thumb badge</p>
              <p className="text-sm text-gray-500">May 20, 2023</p>
            </div>
          </div>
        </div>
      </div>
  ];

  // Admin Dashboard Cards
  const adminCards = [
    // Stats Card
    <div key="admin-stats" className="glass-card p-6 leaf-shape organic-shadow h-full flex flex-col min-h-[400px] min-w-[300px]">
      <h2 className="text-xl font-semibold text-green-700 mb-4 break-words truncate">Admin Dashboard</h2>
      <div className="flex-1 flex flex-col justify-center gap-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
        ) : (
          <>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Total Volunteers</p>
              <p className="text-2xl font-semibold text-green-700">{stats?.totalVolunteers || 0}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Total Events</p>
              <p className="text-2xl font-semibold text-blue-700">{stats?.totalEvents || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Urgent Events</p>
              <p className="text-2xl font-semibold text-purple-700">{stats?.urgentEvents || 0}</p>
          </div>
          </>
        )}
      </div>
    </div>,
    // Matching Alerts Card
    <div key="admin-matching" className="glass-card p-6 organic-shadow h-full flex flex-col justify-between min-h-[400px] min-w-[300px]">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-green-700 break-words truncate">Matching Alerts</h2>
        <a href="#" className="text-sm text-green-600 hover:text-green-500 whitespace-nowrap truncate">View all</a>
        </div>
        <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : urgentAlerts.length > 0 ? (
          urgentAlerts.slice(0, 2).map((alert, index) => (
            <div key={index} className="flex items-start">
              <div className={`flex-shrink-0 rounded-full p-2 ${
                alert.urgency === 'critical' ? 'bg-red-100' : 
                alert.urgency === 'high' ? 'bg-orange-100' : 'bg-yellow-100'
              }`}>
                <i className={`fas ${
                  alert.urgency === 'critical' ? 'fa-exclamation-triangle text-red-600' :
                  alert.urgency === 'high' ? 'fa-exclamation-circle text-orange-600' :
                  'fa-info-circle text-yellow-600'
                }`}></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                  {alert.event.title} ({alert.availableSpots} spots available)
              </p>
                <p className="text-sm text-gray-500">
                  Skills needed: {alert.event.requiredSkills.join(', ')}
                </p>
                <button 
                  onClick={() => onNavigate?.('events')}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  View Event
              </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
            <p className="text-sm">No urgent alerts at the moment</p>
          </div>
        )}
      </div>
    </div>,
    // System Notifications Card
    <div key="admin-notifications" className="glass-card p-6 organic-shadow h-full flex flex-col justify-between min-h-[400px] min-w-[300px]">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-green-700 break-words truncate">System Notifications</h2>
        <a href="#" className="text-sm text-green-600 hover:text-green-500 whitespace-nowrap truncate">View all</a>
        </div>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
              <i className="fas fa-tools text-blue-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                System maintenance scheduled for June 15, 2:00 AM - 4:00 AM
              </p>
              <p className="text-sm text-gray-500">2 days remaining</p>
            </div>
          </div>
        </div>
      </div>
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch min-w-[1000px]">
            {(user.role === 'admin' ? adminCards : volunteerCards).map((card, idx) => (
              <React.Fragment key={idx}>{card}</React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;