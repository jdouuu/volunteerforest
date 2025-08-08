import { useState, FC } from 'react';
import { Volunteer } from '../services/api';
import { Event } from './Events';

interface HistoryProps {
  user: Volunteer | null;
}

interface VolunteerHistory {
  eventId: string;
  event: Event;
  participationStatus: 'completed' | 'cancelled' | 'no-show' | 'pending';
  registrationDate: Date;
  completionDate?: Date;
  hoursVolunteered?: number;
  rating?: number;
  feedback?: string;
  certificateEarned?: boolean;
}

const History: FC<HistoryProps> = ({ user }) => {
  if (!user) return null;

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'hours' | 'rating'>('date');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<VolunteerHistory[] | null>(null);

  // Mock volunteer history data
  const volunteerHistorySeed: VolunteerHistory[] = [
    {
      eventId: '1',
      event: {
        id: '1',
        title: 'Community Garden Cleanup',
        description: 'Helped with weeding, planting, and general garden maintenance.',
        date: '2024-05-15',
        startTime: '09:00',
        endTime: '12:00',
        location: 'Downtown Community Center, 123 Main St',
        maxVolunteers: 20,
        currentVolunteers: 20,
        category: 'environmental',
        skills: ['gardening', 'physical labor'],
        status: 'completed',
        organizer: 'Green Thumb Initiative',
        contactEmail: 'garden@community.org',
        contactPhone: '(555) 123-4567',
        requirements: 'Bring comfortable clothes and water bottle.',
        imageUrl: 'https://placehold.co/400x200/4ade80/ffffff?text=Community+Garden'
      },
      participationStatus: 'completed',
      registrationDate: new Date('2024-05-10'),
      completionDate: new Date('2024-05-15'),
      hoursVolunteered: 3,
      rating: 5,
      feedback: 'Great experience! Well organized and meaningful work.',
      certificateEarned: true
    },
    {
      eventId: '2',
      event: {
        id: '2',
        title: 'Food Bank Distribution',
        description: 'Assisted with sorting and distributing food packages to families in need.',
        date: '2024-05-08',
        startTime: '08:00',
        endTime: '14:00',
        location: 'Northside Food Pantry, 456 Oak Ave',
        maxVolunteers: 15,
        currentVolunteers: 15,
        category: 'community',
        skills: ['customer service', 'organization'],
        status: 'completed',
        organizer: 'Northside Food Bank',
        contactEmail: 'volunteer@northsidefood.org',
        contactPhone: '(555) 987-6543',
        requirements: 'Must be able to lift 20 lbs.',
        imageUrl: 'https://placehold.co/400x200/60a5fa/ffffff?text=Food+Bank'
      },
      participationStatus: 'completed',
      registrationDate: new Date('2024-05-01'),
      completionDate: new Date('2024-05-08'),
      hoursVolunteered: 6,
      rating: 4,
      feedback: 'Rewarding work helping families. Could use better organization.',
      certificateEarned: false
    },
    {
      eventId: '3',
      event: {
        id: '3',
        title: 'Senior Center Technology Help',
        description: 'Taught basic computer skills to seniors.',
        date: '2024-04-22',
        startTime: '10:00',
        endTime: '12:00',
        location: 'Golden Years Senior Center, 234 Elder St',
        maxVolunteers: 8,
        currentVolunteers: 8,
        category: 'education',
        skills: ['teaching', 'technical skills'],
        status: 'completed',
        organizer: 'Digital Literacy Program',
        contactEmail: 'tech@digitalliteracy.org',
        contactPhone: '(555) 012-3456',
        requirements: 'Basic computer knowledge required.',
        imageUrl: 'https://placehold.co/400x200/8b5cf6/ffffff?text=Tech+Help'
      },
      participationStatus: 'completed',
      registrationDate: new Date('2024-04-15'),
      completionDate: new Date('2024-04-22'),
      hoursVolunteered: 2,
      rating: 5,
      feedback: 'Loved helping seniors stay connected with technology!',
      certificateEarned: true
    },
    {
      eventId: '4',
      event: {
        id: '4',
        title: 'Beach Cleanup Cancelled',
        description: 'Beach cleanup event that was cancelled due to weather.',
        date: '2024-04-10',
        startTime: '07:00',
        endTime: '12:00',
        location: 'Sunset Beach, 567 Coastal Blvd',
        maxVolunteers: 50,
        currentVolunteers: 35,
        category: 'environmental',
        skills: ['physical labor'],
        status: 'cancelled',
        organizer: 'Ocean Conservation Society',
        contactEmail: 'beach@oceanconservation.org',
        contactPhone: '(555) 345-6789',
        requirements: 'Sunscreen recommended.',
        imageUrl: 'https://placehold.co/400x200/0891b2/ffffff?text=Beach+Cleanup'
      },
      participationStatus: 'cancelled',
      registrationDate: new Date('2024-04-01'),
      hoursVolunteered: 0,
      certificateEarned: false
    }
  ];
  const volunteerHistory: VolunteerHistory[] = historyData || volunteerHistorySeed;

  const filteredHistory = volunteerHistory.filter(item => {
    if (filterStatus !== 'all' && item.participationStatus !== filterStatus) return false;
    if (filterCategory !== 'all' && item.event.category !== filterCategory) return false;
    return true;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.event.date).getTime() - new Date(a.event.date).getTime();
      case 'hours':
        return (b.hoursVolunteered || 0) - (a.hoursVolunteered || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const totalHours = volunteerHistory.reduce((sum, item) => sum + (item.hoursVolunteered || 0), 0);
  const completedEvents = volunteerHistory.filter(item => item.participationStatus === 'completed').length;
  const averageRating = volunteerHistory.filter(item => item.rating).reduce((sum, item, _, arr) => sum + (item.rating || 0) / arr.length, 0);
  const certificatesEarned = volunteerHistory.filter(item => item.certificateEarned).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'environmental': return 'bg-green-100 text-green-800';
      case 'community': return 'bg-blue-100 text-blue-800';
      case 'education': return 'bg-purple-100 text-purple-800';
      case 'health': return 'bg-red-100 text-red-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <i
            key={star}
            className={`fas fa-star text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleUpdateRating = (eventId: string, rating: number) => {
    setHistoryData(prev => {
      const base = prev || volunteerHistory;
      return base.map(item => item.eventId === eventId ? { ...item, rating } : item);
    });
  };

  const handleUpdateFeedback = (eventId: string, feedback: string) => {
    setHistoryData(prev => {
      const base = prev || volunteerHistory;
      return base.map(item => item.eventId === eventId ? { ...item, feedback } : item);
    });
  };

  const exportCSV = () => {
    const rows = ['Event,Category,Status,Date,Hours,Rating,Certificate'];
    sortedHistory.forEach(item => {
      rows.push([
        '"' + item.event.title.replace(/"/g,'""') + '"',
        item.event.category,
        item.participationStatus,
        item.event.date,
        item.hoursVolunteered || 0,
        item.rating || '',
        item.certificateEarned ? 'Yes' : 'No'
      ].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volunteer-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Volunteer History</h1>
          <p className="mt-2 text-gray-600">Track your volunteer journey and achievements</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Export CSV</button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card organic-shadow p-6 text-center hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-green-600 stats-counter">{totalHours}</div>
            <div className="text-sm text-gray-600">Total Hours</div>
            <div className="mt-2">
              <i className="fas fa-clock text-green-500"></i>
            </div>
          </div>
          <div className="glass-card organic-shadow p-6 text-center hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-blue-600 stats-counter">{completedEvents}</div>
            <div className="text-sm text-gray-600">Events Completed</div>
            <div className="mt-2">
              <i className="fas fa-check-circle text-blue-500"></i>
            </div>
          </div>
          <div className="glass-card organic-shadow p-6 text-center hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-yellow-600 stats-counter">{averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
            <div className="mt-2">
              <i className="fas fa-star text-yellow-500"></i>
            </div>
          </div>
          <div className="glass-card organic-shadow p-6 text-center hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-purple-600 stats-counter">{certificatesEarned}</div>
            <div className="text-sm text-gray-600">Certificates Earned</div>
            <div className="mt-2">
              <i className="fas fa-certificate text-purple-500"></i>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card organic-shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-Show</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                <option value="environmental">Environmental</option>
                <option value="community">Community</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'hours' | 'rating')}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="date">Date</option>
                <option value="hours">Hours Volunteered</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-card organic-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedHistory.map((item) => (
                  <tr key={item.eventId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={item.event.imageUrl}
                            alt={item.event.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.event.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.event.organizer}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.event.category)}`}>
                            {item.event.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(item.event.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.event.startTime} - {item.event.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.participationStatus)}`}>
                        {item.participationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.hoursVolunteered || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEntry === item.eventId ? (
                        <div className="flex items-center space-x-1">
                          {[1,2,3,4,5].map(r => (
                            <button
                              key={r}
                              onClick={() => handleUpdateRating(item.eventId, r)}
                              className={`text-sm ${r <= (item.rating || 0) ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none`}
                            >
                              <i className="fas fa-star" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        item.rating ? renderStars(item.rating) : <button onClick={() => setEditingEntry(item.eventId)} className="text-xs text-green-600 underline">Rate</button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.certificateEarned ? (
                        <i className="fas fa-certificate text-yellow-500"></i>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[160px]">
                      {editingEntry === item.eventId ? (
                        <div className="flex flex-col space-y-2">
                          <textarea
                            className="border border-gray-300 rounded p-1 text-xs"
                            placeholder="Feedback..."
                            value={item.feedback || ''}
                            onChange={(e)=>handleUpdateFeedback(item.eventId,e.target.value)}
                          />
                          <div className="flex space-x-2">
                            <button onClick={()=>setEditingEntry(null)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Done</button>
                            <button onClick={()=>{handleUpdateFeedback(item.eventId,'');setEditingEntry(null);}} className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        item.feedback ? <span className="text-xs text-gray-600 line-clamp-2 inline-block">{item.feedback}</span> : <button onClick={()=>setEditingEntry(item.eventId)} className="text-xs text-green-600 underline">Add Feedback</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sortedHistory.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-history text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteer history found</h3>
            <p className="text-gray-500">Start volunteering to build your history!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;