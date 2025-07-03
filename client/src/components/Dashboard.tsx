import { FC } from 'react';
import { User } from '../App';
import NotificationTriggers from './NotificationTriggers';

interface DashboardProps {
  user: User | null;
  onNavigate?: (page: 'dashboard' | 'profile' | 'events') => void;
}

const Dashboard: FC<DashboardProps> = ({ user, onNavigate }) => {
  if (!user) return null;

  const VolunteerDashboard = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 leaf-shape organic-shadow">
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
      </div>

      <div className="glass-card p-6 organic-shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-green-700">Upcoming Events</h2>
          <button 
            onClick={() => onNavigate?.('events')}
            className="text-sm text-green-600 hover:text-green-500"
          >
            View all
          </button>
        </div>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between">
              <h3 className="text-base font-medium text-gray-900">Community Garden Planting</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Tomorrow
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Saturday, June 10 · 9:00 AM - 12:00 PM</p>
            <p className="mt-1 text-sm text-gray-500">Downtown Community Center</p>
            <button 
              onClick={() => onNavigate?.('events')}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              View Details
            </button>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between">
              <h3 className="text-base font-medium text-gray-900">Food Bank Distribution</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Next Week
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Saturday, June 17 · 8:00 AM - 2:00 PM</p>
            <p className="mt-1 text-sm text-gray-500">Northside Food Pantry</p>
            <button 
              onClick={() => onNavigate?.('events')}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 organic-shadow">
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
    </div>
  );

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 leaf-shape organic-shadow">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Total Volunteers</p>
            <p className="text-2xl font-semibold text-green-700">248</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
            <p className="text-2xl font-semibold text-blue-700">12</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Pending Matches</p>
            <p className="text-2xl font-semibold text-purple-700">5</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 organic-shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-green-700">Matching Alerts</h2>
          <a href="#" className="text-sm text-green-600 hover:text-green-500">View all</a>
        </div>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
              <i className="fas fa-exclamation-triangle text-red-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                High need for Weekend Food Bank (5 volunteers short)
              </p>
              <p className="text-sm text-gray-500">Skills needed: Food handling, Customer service</p>
              <button className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Match Volunteers
              </button>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
              <i className="fas fa-exclamation-circle text-yellow-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                New volunteer registered - skills match 3 upcoming events
              </p>
              <p className="text-sm text-gray-500">Gardening, Tutoring, Event planning</p>
              <button className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Review Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 organic-shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-green-700">System Notifications</h2>
          <a href="#" className="text-sm text-green-600 hover:text-green-500">View all</a>
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

      <div className="glass-card p-6 organic-shadow">
        <NotificationTriggers />
      </div>
    </div>
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {user.role === 'admin' ? <AdminDashboard /> : <VolunteerDashboard />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;