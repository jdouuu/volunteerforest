import { Volunteer, Event, MatchingEvent, UrgentAlert, MatchingStats } from './api';

// Mock data for testing
export const mockVolunteer: Volunteer = {
  _id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'volunteer',
  skills: ['gardening', 'cooking', 'teaching'],
  availability: {
    weekdays: { morning: true, afternoon: false, evening: false },
    weekends: { morning: true, afternoon: true, evening: false }
  },
  preferences: {
    maxDistance: 15,
    eventTypes: ['environmental', 'community', 'education'],
    maxHoursPerWeek: 8
  },
  location: {
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  completedEvents: [
    { eventId: '1', hours: 4, rating: 5, date: '2024-01-15' },
    { eventId: '2', hours: 3, rating: 4, date: '2024-01-10' }
  ],
  totalHours: 7,
  averageRating: 4.5,
  profileComplete: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z'
};

export const mockAdmin: Volunteer = {
  ...mockVolunteer,
  _id: '2',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
};

export const mockEvents: Event[] = [
  {
    _id: '1',
    title: 'Community Garden Planting',
    description: 'Help plant vegetables in the community garden',
    eventType: 'environmental',
    requiredSkills: ['gardening'],
    location: {
      address: '456 Garden St',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    startDate: '2024-01-20T09:00:00.000Z',
    endDate: '2024-01-20T12:00:00.000Z',
    duration: 3,
    maxVolunteers: 15,
    currentVolunteers: 8,
    status: 'upcoming',
    organizer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-1234'
    },
    requirements: ['Bring gardening gloves', 'Wear comfortable clothes'],
    benefits: ['Learn gardening skills', 'Meet community members'],
    difficulty: 'easy',
    priority: 'medium',
    averageRating: 4.2,
    totalRatings: 12,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    _id: '2',
    title: 'Food Bank Distribution',
    description: 'Help distribute food to families in need',
    eventType: 'community',
    requiredSkills: ['cooking', 'customer_service'],
    location: {
      address: '789 Food St',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    startDate: '2024-01-25T08:00:00.000Z',
    endDate: '2024-01-25T14:00:00.000Z',
    duration: 6,
    maxVolunteers: 20,
    currentVolunteers: 15,
    status: 'upcoming',
    organizer: {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '555-5678'
    },
    requirements: ['Food safety training', 'Comfortable standing for long periods'],
    benefits: ['Help families in need', 'Gain food service experience'],
    difficulty: 'moderate',
    priority: 'high',
    averageRating: 4.5,
    totalRatings: 8,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  }
];

export const mockMatchingEvents: MatchingEvent[] = [
  {
    event: mockEvents[0],
    matchScore: 0.85,
    distance: 2.5
  },
  {
    event: mockEvents[1],
    matchScore: 0.72,
    distance: 5.1
  }
];

export const mockUrgentAlerts: UrgentAlert[] = [
  {
    event: {
      ...mockEvents[0],
      currentVolunteers: 12,
      maxVolunteers: 15
    },
    availableSpots: 3,
    urgency: 'high'
  },
  {
    event: {
      ...mockEvents[1],
      currentVolunteers: 18,
      maxVolunteers: 20
    },
    availableSpots: 2,
    urgency: 'medium'
  }
];

export const mockMatchingStats: MatchingStats = {
  totalVolunteers: 248,
  totalEvents: 12,
  urgentEvents: 3,
  pendingMatches: 5
};

// Mock API service for testing
export class MockApiService {
  async login(credentials: { email: string; password: string }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (credentials.email === 'admin@example.com') {
      return {
        success: true,
        data: {
          volunteer: mockAdmin,
          token: 'mock-admin-token'
        }
      };
    }
    
    return {
      success: true,
      data: {
        volunteer: mockVolunteer,
        token: 'mock-volunteer-token'
      }
    };
  }

  async register(data: { name: string; email: string; password: string }) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        volunteer: { ...mockVolunteer, name: data.name, email: data.email },
        token: 'mock-register-token'
      }
    };
  }

  async verifyToken() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      data: {
        user: mockVolunteer
      }
    };
  }

  async getMatchingStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: mockMatchingStats
    };
  }

  async getUrgentAlerts() {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      data: mockUrgentAlerts
    };
  }

  async getMatchingEvents(volunteerId: string, limit: number = 10) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      data: mockMatchingEvents.slice(0, limit)
    };
  }

  setAuthToken(token: string) {
    localStorage.setItem('token', token);
  }

  getAuthToken() {
    return localStorage.getItem('token');
  }

  removeAuthToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.getAuthToken();
  }
} 