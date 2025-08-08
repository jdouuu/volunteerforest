import { useState, FC, useEffect } from 'react';
import { Volunteer, Event as ApiEvent } from '../services/api';
import apiService from '../services/api';
import EventForm from './EventForm';
import { useNotifications } from '../context/NotificationContext';

interface EventsProps {
  user: Volunteer | null;
}

// Local Event interface for compatibility
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  maxVolunteers: number;
  currentVolunteers: number;
  category: 'environmental' | 'community' | 'education' | 'health' | 'other';
  skills: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  requirements: string;
  imageUrl?: string;
}

const Events: FC<EventsProps> = ({ user }) => {
  const { 
    triggerEventAssignment, 
    triggerEventUpdate, 
    triggerEventReminder, 
    triggerVolunteerMatch 
  } = useNotifications();

  const [events, setEvents] = useState<Event[]>([]);
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await apiService.getEvents(currentPage, 12);
        if (response.success) {
          setApiEvents(response.data.events);
          setTotalPages(response.data.totalPages);
          
          // Convert API events to local format
          const convertedEvents: Event[] = response.data.events.map((apiEvent: any) => {
            const dateObj = new Date(apiEvent.eventDate);
            return {
              id: apiEvent._id,
              title: apiEvent.eventName,
              description: apiEvent.description,
              date: dateObj.toISOString().split('T')[0],
              startTime: dateObj.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
              endTime: new Date(dateObj.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
              location: `${apiEvent.location.address}, ${apiEvent.location.city}, ${apiEvent.location.state}`,
              maxVolunteers: apiEvent.maxVolunteers || 10,
              currentVolunteers: apiEvent.currentVolunteers || 0,
              category: apiEvent.urgency === 'critical' || apiEvent.urgency === 'high' ? 'health' : 'community',
              skills: apiEvent.requiredSkills || [],
              status: apiEvent.status === 'active' ? 'ongoing' : (apiEvent.status as any) || 'upcoming',
              organizer: apiEvent.organizer?.name || 'Organizer',
              contactEmail: apiEvent.organizer?.email || 'organizer@example.com',
              contactPhone: apiEvent.organizer?.phone || '',
              requirements: (apiEvent.requiredSkills || []).join(', '),
              imageUrl: `https://placehold.co/400x200/4ade80/ffffff?text=${encodeURIComponent(apiEvent.eventName)}`
            };
          });
          
          setEvents(convertedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to mock data if API fails
        setEvents([
          {
            id: '1',
            title: 'Community Garden Planting',
            description: 'Join us for a day of planting vegetables and herbs in our community garden. Perfect for all skill levels!',
            date: '2024-06-15',
            startTime: '09:00',
            endTime: '12:00',
            location: 'Downtown Community Center, 123 Main St',
            maxVolunteers: 20,
            currentVolunteers: 15,
            category: 'environmental',
            skills: ['gardening', 'physical labor'],
            status: 'upcoming',
            organizer: 'Green Thumb Initiative',
            contactEmail: 'garden@community.org',
            contactPhone: '(555) 123-4567',
            requirements: 'Bring comfortable clothes and water bottle. Tools provided.',
            imageUrl: 'https://placehold.co/400x200/4ade80/ffffff?text=Community+Garden'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user, currentPage]);

  if (!user) return null;

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'community', label: 'Community' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory, selectedStatus]);

  const handleRegisterForEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      triggerEventAssignment(event.title, eventId);
    }
    
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, currentVolunteers: Math.min(event.currentVolunteers + 1, event.maxVolunteers) }
        : event
    ));
  };

  const handleUnregisterFromEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, currentVolunteers: Math.max(event.currentVolunteers - 1, 0) }
        : event
    ));
  };

  const handleCreateEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      const dateTimeISO = new Date(`${eventData.date}T${eventData.startTime}:00`).toISOString();
      
      const payload = {
        eventName: eventData.title,
        description: eventData.description,
        location: {
          address: eventData.location.split(',')[0]?.trim() || eventData.location,
          city: eventData.location.split(',')[1]?.trim() || 'Houston',
          state: eventData.location.split(',')[2]?.trim() || 'TX',
          zipcode: eventData.location.split(',')[3]?.trim() || '77001'
        },
        requiredSkills: eventData.skills,
        urgency: 'medium',
        eventDate: dateTimeISO,
        maxVolunteers: eventData.maxVolunteers,
        organizer: {
          name: eventData.organizer || 'Organizer',
          email: eventData.contactEmail || 'organizer@example.com',
          phone: eventData.contactPhone || ''
        }
      };

      const res = await apiService.createEvent(payload as any);
      if (res.success) {
        // Refresh events list from API
        const refreshed = await apiService.getEvents(currentPage, 12);
        if (refreshed.success) {
          const converted: Event[] = refreshed.data.events.map((apiEvent: any) => {
            const dateObj = new Date(apiEvent.eventDate);
            return {
              id: apiEvent._id,
              title: apiEvent.eventName,
              description: apiEvent.description,
              date: dateObj.toISOString().split('T')[0],
              startTime: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              endTime: new Date(dateObj.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              location: `${apiEvent.location.address}, ${apiEvent.location.city}, ${apiEvent.location.state}`,
              maxVolunteers: apiEvent.maxVolunteers || 10,
              currentVolunteers: apiEvent.currentVolunteers || 0,
              category: apiEvent.urgency === 'critical' || apiEvent.urgency === 'high' ? 'health' : 'community',
              skills: apiEvent.requiredSkills || [],
              status: apiEvent.status === 'active' ? 'ongoing' : (apiEvent.status as any) || 'upcoming',
              organizer: apiEvent.organizer?.name || 'Organizer',
              contactEmail: apiEvent.organizer?.email || 'organizer@example.com',
              contactPhone: apiEvent.organizer?.phone || '',
              requirements: (apiEvent.requiredSkills || []).join(', '),
              imageUrl: `https://placehold.co/400x200/4ade80/ffffff?text=${encodeURIComponent(apiEvent.eventName)}`
            };
          });
          setEvents(converted);
        }
        setShowCreateModal(false);
      } else {
        console.error('Failed to create event:', res.message);
        alert('Failed to create event: ' + (res.message || 'Unknown error'));
      }
    } catch (e) {
      console.error('Error creating event:', e);
      alert('Error creating event: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const handleUpdateEvent = async (eventData: Omit<Event, 'id'>) => {
    if (!editingEvent) return;
    try {
      const dateTimeISO = new Date(`${eventData.date}T${eventData.startTime}:00`).toISOString();
      const payload = {
        eventName: eventData.title,
        description: eventData.description,
        location: {
          address: eventData.location.split(',')[0]?.trim() || eventData.location,
          city: eventData.location.split(',')[1]?.trim() || 'Houston',
          state: eventData.location.split(',')[2]?.trim() || 'TX',
          zipcode: eventData.location.split(',')[3]?.trim() || '77001'
        },
        requiredSkills: eventData.skills,
        urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        eventDate: dateTimeISO,
        maxVolunteers: eventData.maxVolunteers,
        organizer: {
          name: eventData.organizer,
          email: eventData.contactEmail,
          phone: eventData.contactPhone
        }
      };
      
      await apiService.updateEvent(editingEvent.id, payload);
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...eventData, id: editingEvent.id, currentVolunteers: ev.currentVolunteers } : ev));
      setEditingEvent(null);
    } catch (e) {
      console.error('Failed to update event:', e);
      alert('Failed to update event: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await apiService.deleteEvent(eventId);
      setEvents(prev => prev.filter(ev => ev.id !== eventId));
    } catch (e) {
      console.error('Failed to delete event:', e);
      alert('Failed to delete event: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isUserRegistered = (eventId: string) => {
    // Mock function - in real app, check against user's registered events
    return false;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="mt-2 text-gray-600">Find and join volunteer opportunities in your community</p>
          </div>
          {user.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Create Event
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="glass-card organic-shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="glass-card organic-shadow overflow-hidden">
                {event.imageUrl && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-calendar mr-2"></i>
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-clock mr-2"></i>
                      {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-users mr-2"></i>
                      {event.currentVolunteers}/{event.maxVolunteers} volunteers
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    {event.skills.slice(0, 2).map(skill => (
                      <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {skill}
                      </span>
                    ))}
                    {event.skills.length > 2 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{event.skills.length - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      View Details
                    </button>
                    {user.role === 'admin' ? (
                      <div className="flex space-x-1 flex-1">
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="flex-1 px-2 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this event?')) {
                              handleDeleteEvent(event.id);
                            }
                          }}
                          className="flex-1 px-2 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      !isUserRegistered(event.id) ? (
                        <button
                          onClick={() => handleRegisterForEvent(event.id)}
                          disabled={event.currentVolunteers >= event.maxVolunteers}
                          className="flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {event.currentVolunteers >= event.maxVolunteers ? 'Full' : 'Register'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnregisterFromEvent(event.id)}
                          className="flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Unregister
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-calendar-times text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Modals */}
        {showCreateModal && (
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowCreateModal(false)}
          />
        )}

        {editingEvent && (
          <EventForm
            event={editingEvent}
            onSubmit={handleUpdateEvent}
            onCancel={() => setEditingEvent(null)}
            isEditing={true}
          />
        )}

        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedEvent.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-calendar mr-2"></i>
                    {formatDate(selectedEvent.date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-clock mr-2"></i>
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    {selectedEvent.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-users mr-2"></i>
                    {selectedEvent.currentVolunteers}/{selectedEvent.maxVolunteers} volunteers
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-user mr-2"></i>
                    Organized by {selectedEvent.organizer}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-envelope mr-2"></i>
                    {selectedEvent.contactEmail}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-phone mr-2"></i>
                    {selectedEvent.contactPhone}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.skills.map(skill => (
                      <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                  <p className="text-sm text-gray-600">{selectedEvent.requirements}</p>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Close
                  </button>
                  {user.role !== 'admin' && (
                    !isUserRegistered(selectedEvent.id) ? (
                      <button
                        onClick={() => {
                          handleRegisterForEvent(selectedEvent.id);
                          setShowEventModal(false);
                        }}
                        disabled={selectedEvent.currentVolunteers >= selectedEvent.maxVolunteers}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {selectedEvent.currentVolunteers >= selectedEvent.maxVolunteers ? 'Full' : 'Register'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleUnregisterFromEvent(selectedEvent.id);
                          setShowEventModal(false);
                        }}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Unregister
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events; 
