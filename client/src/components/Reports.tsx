// client/src/components/Reports.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  status?: string;
  skillFilter?: string;
  minHours?: number;
  maxHours?: number;
  organizerFilter?: string;
}

interface VolunteerReportData {
  id: string;
  name: string;
  email: string;
  totalHours: number;
  averageRating: number;
  totalEvents: number;
  skills: string[];
  location?: {
    city?: string;
    state?: string;
  };
  memberSince: string;
  recentEvents: {
    title?: string;
    date: string;
    hours: number;
    rating?: number;
  }[];
}

interface EventReportData {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  status: string;
  maxVolunteers: number;
  actualVolunteers: number;
  totalHoursWorked: number;
  averageRating: number;
  organizer?: {
    name?: string;
  };
  location?: {
    city?: string;
    state?: string;
  };
  capacityUtilization: string;
  assignedVolunteers: {
    name: string;
    email: string;
    hoursWorked: number;
    rating?: number;
  }[];
}

interface ReportSummary {
  totalVolunteers?: number;
  totalHours?: number;
  totalEvents?: number;
  averageHoursPerVolunteer?: string;
  avgCapacityUtilization?: string;
  totalVolunteerAssignments?: number;
  totalVolunteerHours?: number;
  eventsByStatus?: Record<string, number>;
  eventsByType?: Record<string, number>;
  skillsDistribution?: Record<string, number>;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'volunteers' | 'events' | 'summary'>('volunteers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Report data states
  const [volunteerData, setVolunteerData] = useState<VolunteerReportData[]>([]);
  const [eventData, setEventData] = useState<EventReportData[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [reportSummary, setReportSummary] = useState<ReportSummary>({});
  
  // Filter states
  const [filters, setFilters] = useState<ReportFilters>({});

  const eventTypes = [
    'environmental', 'education', 'healthcare', 'community', 'animals', 'seniors', 'children'
  ];

  const eventStatuses = ['upcoming', 'active', 'completed', 'cancelled'];

  const skills = [
    'gardening', 'cooking', 'teaching', 'construction', 'medical', 
    'technology', 'art', 'music', 'sports', 'language', 'driving',
    'customer_service', 'event_planning', 'fundraising', 'mentoring'
  ];

  const fetchVolunteerReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params[key] = value.toString();
        }
      });

      const response = await api.getVolunteerReport(params);
      
      if (response.success) {
        setVolunteerData(response.data.data || response.data);
        setReportSummary(response.data.summary || {});
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch volunteer report');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params[key] = value.toString();
        }
      });

      const response = await api.getEventReport(params);
      
      if (response.success) {
        setEventData(response.data.data || response.data);
        setReportSummary(response.data.summary || {});
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch event report');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getSummaryReport();
      
      if (response.success) {
        setSummaryData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch summary report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: 'csv' | 'pdf') => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      queryParams.append('format', format);

      const endpoint = activeTab === 'volunteers' ? 'volunteers' : 
                     activeTab === 'events' ? 'events' : 'summary';

      const response = await fetch(`${api.getBaseURL()}/reports/${endpoint}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${endpoint}_report_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(`Failed to download ${format.toUpperCase()} report`);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const generateReport = () => {
    if (activeTab === 'volunteers') {
      fetchVolunteerReport();
    } else if (activeTab === 'events') {
      fetchEventReport();
    } else {
      fetchSummaryReport();
    }
  };

  useEffect(() => {
    generateReport();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Reports</h1>
        <p className="text-gray-600 mt-2">Generate and download comprehensive reports on volunteer activities and event management.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'volunteers'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Volunteer Reports
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Event Reports
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'summary'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Summary Report
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Type</label>
            <select
              value={filters.eventType || ''}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            >
              <option value="">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Event Status (Events tab only) */}
          {activeTab === 'events' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                {eventStatuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Hours Range (Volunteers tab only) */}
          {activeTab === 'volunteers' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Hours</label>
                <input
                  type="number"
                  min="0"
                  value={filters.minHours || ''}
                  onChange={(e) => handleFilterChange('minHours', parseInt(e.target.value) || undefined)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Hours</label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxHours || ''}
                  onChange={(e) => handleFilterChange('maxHours', parseInt(e.target.value) || undefined)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={filters.skillFilter || ''}
                  onChange={(e) => handleFilterChange('skillFilter', e.target.value)}
                  placeholder="gardening,teaching,medical"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
              </div>
            </>
          )}

          {/* Organizer Filter (Events tab only) */}
          {activeTab === 'events' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Organizer</label>
              <input
                type="text"
                value={filters.organizerFilter || ''}
                onChange={(e) => handleFilterChange('organizerFilter', e.target.value)}
                placeholder="Organizer name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => downloadReport('csv')}
              disabled={loading || (activeTab === 'volunteers' && volunteerData.length === 0) || (activeTab === 'events' && eventData.length === 0)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Download CSV
            </button>
            <button
              onClick={() => downloadReport('pdf')}
              disabled={loading || (activeTab === 'volunteers' && volunteerData.length === 0) || (activeTab === 'events' && eventData.length === 0)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {reportSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {activeTab === 'volunteers' && (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">V</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Volunteers</dt>
                        <dd className="text-lg font-medium text-gray-900">{reportSummary.totalVolunteers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">H</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Hours</dt>
                        <dd className="text-lg font-medium text-gray-900">{reportSummary.totalHours}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">E</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                        <dd className="text-lg font-medium text-gray-900">{reportSummary.totalEvents}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">Avg</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Avg Hours/Volunteer</dt>
                        <dd className="text-lg font-medium text-gray-900">{reportSummary.averageHoursPerVolunteer}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'events' && (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">E</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                        <dd className="text-lg font-medium text-gray-900">{reportSummary.totalEvents}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">A</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Assignments</dt>
                        <dd className="text-lg font-medium text-gray-900">{reportSummary.totalVolunteerAssignments}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">C</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Avg Capacity</dt>
                        <dd className="text-lg font-medium text-gray-900">{reportSummary.avgCapacityUtilization}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">H</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Vol Hours</dt>
                        <dd className="text-lg font-medium text-gray-900">{reportSummary.totalVolunteerHours}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Report Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {activeTab === 'volunteers' && 'Volunteer Participation Report'}
            {activeTab === 'events' && 'Event Management Report'}
            {activeTab === 'summary' && 'System Summary Report'}
          </h3>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          )}

          {!loading && activeTab === 'volunteers' && (
            <VolunteerReportTable data={volunteerData} />
          )}

          {!loading && activeTab === 'events' && (
            <EventReportTable data={eventData} />
          )}

          {!loading && activeTab === 'summary' && summaryData && (
            <SummaryReportView data={summaryData} />
          )}
        </div>
      </div>
    </div>
  );
};

// Volunteer Report Table Component
const VolunteerReportTable: React.FC<{ data: VolunteerReportData[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No volunteer data found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Volunteer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Events
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Skills
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((volunteer) => (
            <tr key={volunteer.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                  <div className="text-sm text-gray-500">{volunteer.email}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {volunteer.totalHours}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {volunteer.totalEvents}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {volunteer.averageRating ? volunteer.averageRating.toFixed(1) : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex flex-wrap gap-1">
                  {volunteer.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {skill}
                    </span>
                  ))}
                  {volunteer.skills.length > 3 && (
                    <span className="text-xs text-gray-500">+{volunteer.skills.length - 3} more</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {volunteer.location?.city && volunteer.location?.state 
                  ? `${volunteer.location.city}, ${volunteer.location.state}` 
                  : 'Not specified'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Event Report Table Component
const EventReportTable: React.FC<{ data: EventReportData[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No event data found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Volunteers
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Capacity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((event) => (
            <tr key={event.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-500">{event.eventType}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(event.startDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {event.actualVolunteers} / {event.maxVolunteers}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {event.totalHoursWorked}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {event.capacityUtilization}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {event.averageRating ? event.averageRating.toFixed(1) : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.status === 'completed' ? 'bg-green-100 text-green-800' :
                  event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  event.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {event.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Summary Report View Component
const SummaryReportView: React.FC<{ data: any }> = ({ data }) => {
  const overview = data.overview;
  const distributions = data.distributions;
  const topPerformers = data.topPerformers;

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">System Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{overview.totalVolunteers}</div>
            <div className="text-sm text-gray-600">Total Volunteers</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{overview.totalEvents}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{overview.totalVolunteerHours}</div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{overview.avgVolunteerRating?.toFixed(1) || 'N/A'}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Event Type Distribution */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Events by Type</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {distributions.eventTypes?.map((eventType: any) => (
            <div key={eventType._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="capitalize font-medium">{eventType._id}</span>
                <span className="text-lg font-bold">{eventType.count}</span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Avg Rating: {eventType.avgRating?.toFixed(1) || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Top Volunteers</h4>
        <div className="space-y-2">
          {topPerformers.volunteers?.slice(0, 5).map((volunteer: any, index: number) => (
            <div key={volunteer._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{volunteer.name}</span>
                <span className="text-gray-600 ml-2">({volunteer.email})</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{volunteer.totalHours} hours</div>
                <div className="text-sm text-gray-600">{volunteer.completedEvents?.length || 0} events</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
