import { useState, FC, useEffect } from 'react';
import { User } from '../App';
import EventForm from './EventForm';
import { useNotifications } from '../context/NotificationContext';

interface EventsProps {
  user: User | null;
}

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
  if (!user) return null;

  const { 
    triggerEventAssignment, 
    triggerEventUpdate, 
    triggerEventReminder, 
    triggerVolunteerMatch 
  } = useNotifications();

  const [events, setEvents] = useState<Event[]>([
    // Environmental Events
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
    },
    {
      id: '2',
      title: 'Riverside Cleanup',
      description: 'Help clean up our local river and maintain the walking trails. Environmental stewardship in action!',
      date: '2024-06-10',
      startTime: '10:00',
      endTime: '15:00',
      location: 'Riverside Park, 789 River Rd',
      maxVolunteers: 25,
      currentVolunteers: 18,
      category: 'environmental',
      skills: ['physical labor', 'environmental awareness'],
      status: 'upcoming',
      organizer: 'River Conservation Group',
      contactEmail: 'cleanup@riverconservation.org',
      contactPhone: '(555) 456-7890',
      requirements: 'Gloves and bags provided. Wear sturdy shoes.',
      imageUrl: 'https://placehold.co/400x200/34d399/ffffff?text=Riverside+Cleanup'
    },
    {
      id: '3',
      title: 'Tree Planting Initiative',
      description: 'Help us plant 100 native trees to restore our urban forest and improve air quality in the city.',
      date: '2024-06-22',
      startTime: '08:00',
      endTime: '16:00',
      location: 'Central Park, 321 Park Ave',
      maxVolunteers: 30,
      currentVolunteers: 22,
      category: 'environmental',
      skills: ['physical labor', 'gardening'],
      status: 'upcoming',
      organizer: 'Urban Forest Alliance',
      contactEmail: 'trees@urbanforest.org',
      contactPhone: '(555) 234-5678',
      requirements: 'Sturdy boots required. Lunch provided. Bring your own water bottle.',
      imageUrl: 'https://placehold.co/400x200/059669/ffffff?text=Tree+Planting'
    },
    {
      id: '4',
      title: 'Beach Cleanup Day',
      description: 'Join our annual beach cleanup to protect marine life and keep our coastline beautiful.',
      date: '2024-06-29',
      startTime: '07:00',
      endTime: '12:00',
      location: 'Sunset Beach, 567 Coastal Blvd',
      maxVolunteers: 50,
      currentVolunteers: 35,
      category: 'environmental',
      skills: ['physical labor', 'environmental awareness'],
      status: 'upcoming',
      organizer: 'Ocean Conservation Society',
      contactEmail: 'beach@oceanconservation.org',
      contactPhone: '(555) 345-6789',
      requirements: 'Sunscreen and hat recommended. Bags and gloves provided.',
      imageUrl: 'https://placehold.co/400x200/0891b2/ffffff?text=Beach+Cleanup'
    },
    {
      id: '5',
      title: 'Recycling Education Workshop',
      description: 'Teach children about recycling and environmental conservation through interactive activities.',
      date: '2024-06-12',
      startTime: '14:00',
      endTime: '17:00',
      location: 'Public Library, 890 Education Dr',
      maxVolunteers: 12,
      currentVolunteers: 8,
      category: 'environmental',
      skills: ['teaching', 'communication'],
      status: 'upcoming',
      organizer: 'Environmental Education Center',
      contactEmail: 'education@envcenter.org',
      contactPhone: '(555) 456-7890',
      requirements: 'Experience working with children preferred. Materials provided.',
      imageUrl: 'https://placehold.co/400x200/10b981/ffffff?text=Recycling+Workshop'
    },

    // Community Events
    {
      id: '6',
      title: 'Food Bank Distribution',
      description: 'Help distribute food packages to families in need. Great opportunity to make a direct impact.',
      date: '2024-06-17',
      startTime: '08:00',
      endTime: '14:00',
      location: 'Northside Food Pantry, 456 Oak Ave',
      maxVolunteers: 15,
      currentVolunteers: 10,
      category: 'community',
      skills: ['customer service', 'organization'],
      status: 'upcoming',
      organizer: 'Northside Food Bank',
      contactEmail: 'volunteer@northsidefood.org',
      contactPhone: '(555) 987-6543',
      requirements: 'Must be able to lift 20 lbs. Training provided.',
      imageUrl: 'https://placehold.co/400x200/60a5fa/ffffff?text=Food+Bank'
    },
    {
      id: '7',
      title: 'Senior Center Social Hour',
      description: 'Spend time with seniors, play games, and help with activities at the local senior center.',
      date: '2024-06-14',
      startTime: '13:00',
      endTime: '16:00',
      location: 'Golden Years Senior Center, 234 Elder St',
      maxVolunteers: 10,
      currentVolunteers: 6,
      category: 'community',
      skills: ['communication', 'patience'],
      status: 'upcoming',
      organizer: 'Senior Care Network',
      contactEmail: 'seniors@carenetwork.org',
      contactPhone: '(555) 567-8901',
      requirements: 'Patience and good listening skills. Background check required.',
      imageUrl: 'https://placehold.co/400x200/3b82f6/ffffff?text=Senior+Center'
    },
    {
      id: '8',
      title: 'Homeless Shelter Meal Service',
      description: 'Prepare and serve meals to residents at the local homeless shelter.',
      date: '2024-06-20',
      startTime: '16:00',
      endTime: '20:00',
      location: 'Hope Shelter, 678 Hope St',
      maxVolunteers: 8,
      currentVolunteers: 5,
      category: 'community',
      skills: ['cooking', 'customer service'],
      status: 'upcoming',
      organizer: 'Hope Shelter Foundation',
      contactEmail: 'meals@hopeshelter.org',
      contactPhone: '(555) 678-9012',
      requirements: 'Food safety training provided. Hair nets and gloves required.',
      imageUrl: 'https://placehold.co/400x200/1d4ed8/ffffff?text=Shelter+Meals'
    },
    {
      id: '9',
      title: 'Community Blood Drive',
      description: 'Help organize and support our community blood drive to save lives.',
      date: '2024-06-25',
      startTime: '09:00',
      endTime: '18:00',
      location: 'Community Center, 345 Community Ave',
      maxVolunteers: 20,
      currentVolunteers: 12,
      category: 'community',
      skills: ['organization', 'customer service'],
      status: 'upcoming',
      organizer: 'Red Cross Local Chapter',
      contactEmail: 'blood@redcross.org',
      contactPhone: '(555) 789-0123',
      requirements: 'Training provided. Must be comfortable with medical environment.',
      imageUrl: 'https://placehold.co/400x200/dc2626/ffffff?text=Blood+Drive'
    },
    {
      id: '10',
      title: 'Neighborhood Watch Meeting',
      description: 'Help organize and facilitate neighborhood safety meetings and patrol coordination.',
      date: '2024-06-18',
      startTime: '19:00',
      endTime: '21:00',
      location: 'Police Community Center, 456 Safety St',
      maxVolunteers: 15,
      currentVolunteers: 9,
      category: 'community',
      skills: ['organization', 'communication'],
      status: 'upcoming',
      organizer: 'Neighborhood Safety Coalition',
      contactEmail: 'safety@neighborhood.org',
      contactPhone: '(555) 890-1234',
      requirements: 'Background check required. Training provided.',
      imageUrl: 'https://placehold.co/400x200/7c3aed/ffffff?text=Neighborhood+Watch'
    },

    // Education Events
    {
      id: '11',
      title: 'After-School Tutoring Program',
      description: 'Provide homework help and academic support to elementary school students.',
      date: '2024-06-13',
      startTime: '15:00',
      endTime: '17:00',
      location: 'Lincoln Elementary School, 567 School St',
      maxVolunteers: 12,
      currentVolunteers: 8,
      category: 'education',
      skills: ['teaching', 'patience'],
      status: 'upcoming',
      organizer: 'Education First Initiative',
      contactEmail: 'tutoring@educationfirst.org',
      contactPhone: '(555) 901-2345',
      requirements: 'Background check required. Training provided.',
      imageUrl: 'https://placehold.co/400x200/8b5cf6/ffffff?text=After+School+Tutoring'
    },
    {
      id: '12',
      title: 'Computer Skills Workshop',
      description: 'Teach basic computer skills to seniors and help them stay connected with technology.',
      date: '2024-06-19',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Public Library Computer Lab, 890 Tech Ave',
      maxVolunteers: 8,
      currentVolunteers: 5,
      category: 'education',
      skills: ['technical skills', 'teaching'],
      status: 'upcoming',
      organizer: 'Digital Literacy Program',
      contactEmail: 'tech@digitalliteracy.org',
      contactPhone: '(555) 012-3456',
      requirements: 'Basic computer knowledge required. Patience with beginners.',
      imageUrl: 'https://placehold.co/400x200/7c2d12/ffffff?text=Computer+Workshop'
    },
    {
      id: '13',
      title: 'Reading Buddies Program',
      description: 'Read with children and help develop their literacy skills and love for books.',
      date: '2024-06-16',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Children\'s Library, 123 Book St',
      maxVolunteers: 10,
      currentVolunteers: 7,
      category: 'education',
      skills: ['communication', 'patience'],
      status: 'upcoming',
      organizer: 'Literacy Foundation',
      contactEmail: 'reading@literacy.org',
      contactPhone: '(555) 123-4567',
      requirements: 'Love of reading and children. Background check required.',
      imageUrl: 'https://placehold.co/400x200/f59e0b/ffffff?text=Reading+Buddies'
    },
    {
      id: '14',
      title: 'Science Fair Mentoring',
      description: 'Mentor high school students preparing for the annual science fair.',
      date: '2024-06-21',
      startTime: '16:00',
      endTime: '18:00',
      location: 'High School Science Lab, 456 Science Ave',
      maxVolunteers: 6,
      currentVolunteers: 4,
      category: 'education',
      skills: ['teaching', 'technical skills'],
      status: 'upcoming',
      organizer: 'Science Education Society',
      contactEmail: 'science@sciencefair.org',
      contactPhone: '(555) 234-5678',
      requirements: 'Science background preferred. Training provided.',
      imageUrl: 'https://placehold.co/400x200/06b6d4/ffffff?text=Science+Fair'
    },
    {
      id: '15',
      title: 'ESL Conversation Group',
      description: 'Help immigrants practice English through conversation and cultural exchange.',
      date: '2024-06-24',
      startTime: '18:00',
      endTime: '20:00',
      location: 'Community Center, 789 Language St',
      maxVolunteers: 8,
      currentVolunteers: 5,
      category: 'education',
      skills: ['communication', 'patience'],
      status: 'upcoming',
      organizer: 'Language Learning Center',
      contactEmail: 'esl@languagecenter.org',
      contactPhone: '(555) 345-6789',
      requirements: 'Native English speaker preferred. Cultural sensitivity training provided.',
      imageUrl: 'https://placehold.co/400x200/0ea5e9/ffffff?text=ESL+Conversation'
    },

    // Health Events
    {
      id: '16',
      title: 'Health Fair Support',
      description: 'Help organize and support our community health fair with screenings and information.',
      date: '2024-06-26',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Community Health Center, 567 Health Ave',
      maxVolunteers: 25,
      currentVolunteers: 18,
      category: 'health',
      skills: ['organization', 'customer service'],
      status: 'upcoming',
      organizer: 'Community Health Alliance',
      contactEmail: 'health@healthalliance.org',
      contactPhone: '(555) 456-7890',
      requirements: 'Training provided. Comfortable with medical environment.',
      imageUrl: 'https://placehold.co/400x200/ef4444/ffffff?text=Health+Fair'
    },
    {
      id: '17',
      title: 'Mental Health Awareness Walk',
      description: 'Support mental health awareness by participating in our annual awareness walk.',
      date: '2024-06-28',
      startTime: '08:00',
      endTime: '12:00',
      location: 'City Park, 890 Wellness Blvd',
      maxVolunteers: 40,
      currentVolunteers: 28,
      category: 'health',
      skills: ['communication', 'organization'],
      status: 'upcoming',
      organizer: 'Mental Health Foundation',
      contactEmail: 'walk@mentalhealth.org',
      contactPhone: '(555) 567-8901',
      requirements: 'Comfortable walking 3 miles. T-shirts provided.',
      imageUrl: 'https://placehold.co/400x200/f97316/ffffff?text=Mental+Health+Walk'
    },
    {
      id: '18',
      title: 'First Aid Training Assistant',
      description: 'Assist certified instructors during first aid and CPR training sessions.',
      date: '2024-06-30',
      startTime: '10:00',
      endTime: '16:00',
      location: 'Emergency Services Center, 123 Safety Ave',
      maxVolunteers: 6,
      currentVolunteers: 4,
      category: 'health',
      skills: ['first aid', 'teaching'],
      status: 'upcoming',
      organizer: 'Emergency Response Team',
      contactEmail: 'firstaid@emergency.org',
      contactPhone: '(555) 678-9012',
      requirements: 'First aid certification preferred. Training provided.',
      imageUrl: 'https://placehold.co/400x200/be185d/ffffff?text=First+Aid+Training'
    },
    {
      id: '19',
      title: 'Hospital Gift Shop Volunteer',
      description: 'Help run the hospital gift shop and provide comfort to patients and families.',
      date: '2024-06-27',
      startTime: '12:00',
      endTime: '16:00',
      location: 'City General Hospital, 456 Medical Dr',
      maxVolunteers: 4,
      currentVolunteers: 2,
      category: 'health',
      skills: ['customer service', 'organization'],
      status: 'upcoming',
      organizer: 'Hospital Volunteer Program',
      contactEmail: 'giftshop@hospital.org',
      contactPhone: '(555) 789-0123',
      requirements: 'Background check required. Training provided.',
      imageUrl: 'https://placehold.co/400x200/ec4899/ffffff?text=Hospital+Gift+Shop'
    },
    {
      id: '20',
      title: 'Fitness Class for Seniors',
      description: 'Lead gentle exercise classes for senior citizens to promote health and mobility.',
      date: '2024-06-23',
      startTime: '09:00',
      endTime: '10:30',
      location: 'Senior Recreation Center, 789 Fitness St',
      maxVolunteers: 3,
      currentVolunteers: 2,
      category: 'health',
      skills: ['teaching', 'first aid'],
      status: 'upcoming',
      organizer: 'Senior Fitness Program',
      contactEmail: 'fitness@seniorhealth.org',
      contactPhone: '(555) 890-1234',
      requirements: 'Fitness certification preferred. Training provided.',
      imageUrl: 'https://placehold.co/400x200/14b8a6/ffffff?text=Senior+Fitness'
    },

    // Other Events
    {
      id: '21',
      title: 'Animal Shelter Care',
      description: 'Help care for animals at the local shelter - walking dogs, cleaning, and socializing.',
      date: '2024-06-11',
      startTime: '09:00',
      endTime: '13:00',
      location: 'Paws & Hearts Animal Shelter, 234 Pet Ave',
      maxVolunteers: 12,
      currentVolunteers: 8,
      category: 'other',
      skills: ['physical labor', 'patience'],
      status: 'upcoming',
      organizer: 'Animal Welfare Society',
      contactEmail: 'animals@pawsandhearts.org',
      contactPhone: '(555) 901-2345',
      requirements: 'Comfortable with animals. Training provided.',
      imageUrl: 'https://placehold.co/400x200/84cc16/ffffff?text=Animal+Shelter'
    },
    {
      id: '22',
      title: 'Historical Museum Guide',
      description: 'Lead tours and help visitors learn about local history at the community museum.',
      date: '2024-06-15',
      startTime: '13:00',
      endTime: '17:00',
      location: 'Local History Museum, 567 History St',
      maxVolunteers: 6,
      currentVolunteers: 4,
      category: 'other',
      skills: ['communication', 'organization'],
      status: 'upcoming',
      organizer: 'Historical Society',
      contactEmail: 'museum@history.org',
      contactPhone: '(555) 012-3456',
      requirements: 'Interest in local history. Training provided.',
      imageUrl: 'https://placehold.co/400x200/a3a3a3/ffffff?text=History+Museum'
    },
    {
      id: '23',
      title: 'Community Theater Support',
      description: 'Help with set construction, costumes, and backstage work for community theater production.',
      date: '2024-06-20',
      startTime: '18:00',
      endTime: '22:00',
      location: 'Community Theater, 890 Arts Ave',
      maxVolunteers: 15,
      currentVolunteers: 10,
      category: 'other',
      skills: ['technical skills', 'organization'],
      status: 'upcoming',
      organizer: 'Community Arts Council',
      contactEmail: 'theater@arts.org',
      contactPhone: '(555) 123-4567',
      requirements: 'No experience needed. Training provided.',
      imageUrl: 'https://placehold.co/400x200/6366f1/ffffff?text=Community+Theater'
    },
    {
      id: '24',
      title: 'Disaster Relief Training',
      description: 'Learn emergency response skills and help prepare for community disaster relief efforts.',
      date: '2024-06-25',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Emergency Management Center, 345 Emergency St',
      maxVolunteers: 20,
      currentVolunteers: 15,
      category: 'other',
      skills: ['first aid', 'organization'],
      status: 'upcoming',
      organizer: 'Disaster Relief Team',
      contactEmail: 'disaster@relief.org',
      contactPhone: '(555) 234-5678',
      requirements: 'Physical fitness required. Certification provided.',
      imageUrl: 'https://placehold.co/400x200/78716c/ffffff?text=Disaster+Relief'
    },
    {
      id: '25',
      title: 'Community Newsletter',
      description: 'Help write, edit, and distribute the monthly community newsletter.',
      date: '2024-06-18',
      startTime: '14:00',
      endTime: '17:00',
      location: 'Community Center, 678 News St',
      maxVolunteers: 8,
      currentVolunteers: 5,
      category: 'other',
      skills: ['communication', 'organization'],
      status: 'upcoming',
      organizer: 'Community Communications',
      contactEmail: 'newsletter@community.org',
      contactPhone: '(555) 345-6789',
      requirements: 'Writing skills preferred. Training provided.',
      imageUrl: 'https://placehold.co/400x200/6b7280/ffffff?text=Community+Newsletter'
    }
  ]);

  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

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

  const handleCreateEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      currentVolunteers: 0
    };
    setEvents(prev => [...prev, newEvent]);
    setShowCreateModal(false);
  };

  const handleUpdateEvent = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id 
          ? { ...eventData, id: editingEvent.id, currentVolunteers: editingEvent.currentVolunteers }
          : event
      ));
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
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

        {/* Events Grid */}
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
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {event.currentVolunteers}/{event.maxVolunteers} volunteers
                  </span>
                </div>

                                 <div className="flex space-x-2">
                   <button
                     onClick={() => {
                       setSelectedEvent(event);
                       setShowEventModal(true);
                     }}
                     className="flex-1 px-3 py-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                   >
                     View Details
                   </button>
                   {user.role === 'volunteer' && (
                     <button
                       onClick={() => isUserRegistered(event.id) 
                         ? handleUnregisterFromEvent(event.id)
                         : handleRegisterForEvent(event.id)
                       }
                       disabled={event.currentVolunteers >= event.maxVolunteers && !isUserRegistered(event.id)}
                       className={`flex-1 px-3 py-2 border text-xs font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                         isUserRegistered(event.id)
                           ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                           : event.currentVolunteers >= event.maxVolunteers
                           ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
                           : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                       }`}
                     >
                       {isUserRegistered(event.id) ? 'Unregister' : 'Register'}
                     </button>
                   )}
                   {user.role === 'admin' && (
                     <div className="flex space-x-1">
                       <button
                         onClick={() => setEditingEvent(event)}
                         className="px-2 py-2 border border-blue-300 text-xs font-medium rounded shadow-sm text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                       >
                         <i className="fas fa-edit"></i>
                       </button>
                       <button
                         onClick={() => handleDeleteEvent(event.id)}
                         className="px-2 py-2 border border-red-300 text-xs font-medium rounded shadow-sm text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                       >
                         <i className="fas fa-trash"></i>
                       </button>
                     </div>
                   )}
                 </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              {selectedEvent.imageUrl && (
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Event Details</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><i className="fas fa-calendar mr-2"></i>{formatDate(selectedEvent.date)}</div>
                    <div><i className="fas fa-clock mr-2"></i>{selectedEvent.startTime} - {selectedEvent.endTime}</div>
                    <div><i className="fas fa-map-marker-alt mr-2"></i>{selectedEvent.location}</div>
                    <div><i className="fas fa-users mr-2"></i>{selectedEvent.currentVolunteers}/{selectedEvent.maxVolunteers} volunteers</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><i className="fas fa-user mr-2"></i>{selectedEvent.organizer}</div>
                    <div><i className="fas fa-envelope mr-2"></i>{selectedEvent.contactEmail}</div>
                    <div><i className="fas fa-phone mr-2"></i>{selectedEvent.contactPhone}</div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                <p className="text-gray-600">{selectedEvent.requirements}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Skills Needed</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {user.role === 'volunteer' && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      isUserRegistered(selectedEvent.id) 
                        ? handleUnregisterFromEvent(selectedEvent.id)
                        : handleRegisterForEvent(selectedEvent.id);
                      setShowEventModal(false);
                    }}
                    disabled={selectedEvent.currentVolunteers >= selectedEvent.maxVolunteers && !isUserRegistered(selectedEvent.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      isUserRegistered(selectedEvent.id)
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : selectedEvent.currentVolunteers >= selectedEvent.maxVolunteers
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isUserRegistered(selectedEvent.id) ? 'Unregister' : 'Register for Event'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setShowCreateModal(false)}
          isEditing={false}
        />
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <EventForm
          event={editingEvent}
          onSubmit={handleUpdateEvent}
          onCancel={() => setEditingEvent(null)}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default Events; 