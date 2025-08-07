import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { MockApiService } from './mockData';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Volunteer {
  _id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'admin';
  skills: string[];
  availability: {
    weekdays: { morning: boolean; afternoon: boolean; evening: boolean };
    weekends: { morning: boolean; afternoon: boolean; evening: boolean };
  };
  preferences: {
    maxDistance: number;
    eventTypes: string[];
    maxHoursPerWeek: number;
  };
  location: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: { lat: number; lng: number };
  };
  completedEvents: Array<{
    eventId: string;
    hours: number;
    rating: number;
    date: string;
  }>;
  totalHours: number;
  averageRating: number;
  profileComplete: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  eventType: string;
  requiredSkills: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  startDate: string;
  endDate: string;
  duration: number;
  maxVolunteers: number;
  currentVolunteers: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  organizer: {
    name: string;
    email: string;
    phone: string;
  };
  requirements: string[];
  benefits: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatchingEvent {
  event: Event;
  matchScore: number;
  distance: number;
}

export interface MatchingVolunteer {
  volunteer: Volunteer;
  matchScore: number;
  distance: number;
}

export interface UrgentAlert {
  event: Event;
  availableSpots: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface MatchingStats {
  totalVolunteers: number;
  totalEvents: number;
  urgentEvents: number;
  pendingMatches: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  name?: string;
  skills?: string[];
  availability?: {
    weekdays: { morning: boolean; afternoon: boolean; evening: boolean };
    weekends: { morning: boolean; afternoon: boolean; evening: boolean };
  };
  preferences?: {
    maxDistance: number;
    eventTypes: string[];
    maxHoursPerWeek: number;
  };
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: { lat: number; lng: number };
  };
}

export interface EventCreateData {
  title: string;
  description: string;
  eventType: string;
  requiredSkills: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  startDate: string;
  endDate: string;
  duration: number;
  maxVolunteers: number;
  organizer: {
    name: string;
    email: string;
    phone: string;
  };
  requirements: string[];
  benefits: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

    constructor() {
    // Dynamically set base URL
    if ((import.meta as any).env.PROD) {
      this.baseURL = '';
    } else {
      this.baseURL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';
    }
    console.log('🌐 API Service: Using base URL:', this.baseURL);
    console.log('🌐 Environment check:', {
      isProduction: (import.meta as any).env?.PROD,
      mode: (import.meta as any).env?.MODE,
      viteUrl: (import.meta as any).env.VITE_VERCEL_URL,
      apiUrl: (import.meta as any).env.VITE_API_URL,
      hostname: window.location.hostname
    });
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Check if backend is available
  private async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await this.api.get('/api/health');
      return response.status === 200;
    } catch (error) {
      console.warn('Backend check failed:', error);
      return false;
    }
  }

  // Get the appropriate service (real or mock) - NEVER use for authentication
  private async getService() {
    console.warn('⚠️ getService() called - this should NEVER happen during authentication!');
    console.trace('getService() call stack');
    const isAvailable = await this.isBackendAvailable();
    if (!isAvailable) {
      console.warn('Backend not available, using mock data for non-critical endpoints');
      return new MockApiService();
    }
    return this;
  }

    // Authentication methods - NEVER use getService(), ALWAYS use real backend directly
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ volunteer: Volunteer; token: string }>> {
    // DIRECT API CALL - NO getService() fallback - NO MOCK DATA EVER
    console.log('🔒 AUTHENTICATION: Using direct API call, no fallback');
    try {
      const response: AxiosResponse<any> = await this.api.post('/api/auth/login', {
        userId: credentials.email,
        password: credentials.password
      });
      
      // Transform backend response to match frontend expectations
      const profile = response.data.profile || {};
      
      return {
        success: true,
        data: {
          volunteer: {
            _id: response.data._id,
            name: profile.fullName || 'New Volunteer',
            email: response.data.userId, // Backend uses userId as email
            role: 'volunteer' as const,
            preferences: {
              maxDistance: 50,
              eventTypes: profile.preferences || [],
              maxHoursPerWeek: 40
            },
            availability: {
              weekdays: { morning: false, afternoon: false, evening: false },
              weekends: { morning: false, afternoon: false, evening: false }
            },
            skills: profile.skills || [],
            location: {
              address: profile.address || '',
              city: profile.city || '',
              state: profile.state || '',
              zipCode: profile.zipcode || ''
            },
            completedEvents: [],
            totalHours: 0,
            averageRating: 0,
            profileComplete: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          token: response.data.token
        },
        message: response.data.message || 'Login successful'
      };
    } catch (error: any) {
      console.error('🔒 AUTHENTICATION: Direct API call failed', error);
      return {
        success: false,
        data: {
          volunteer: {} as Volunteer,
          token: ''
        },
        message: error.response?.data?.message || 'Authentication failed - please check your credentials'
      };
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<{ volunteer: Volunteer; token: string }>> {
    try {
      const response: AxiosResponse<any> = await this.api.post('/api/auth/register', {
        userId: data.email,
        password: data.password
      });
      
      // Transform backend response to match frontend expectations
      const profile = response.data.profile || {};
      
      return {
        success: true,
        data: {
          volunteer: {
            _id: response.data._id,
            name: profile.fullName || data.name || 'New Volunteer',
            email: response.data.userId, // Backend uses userId as email
            role: 'volunteer' as const,
            preferences: {
              maxDistance: 50,
              eventTypes: profile.preferences || [],
              maxHoursPerWeek: 40
            },
            availability: {
              weekdays: { morning: false, afternoon: false, evening: false },
              weekends: { morning: false, afternoon: false, evening: false }
            },
            skills: profile.skills || [],
            location: {
              address: profile.address || '',
              city: profile.city || '',
              state: profile.state || '',
              zipCode: profile.zipcode || ''
            },
            completedEvents: [],
            totalHours: 0,
            averageRating: 0,
            profileComplete: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          token: response.data.token
        },
        message: response.data.message || 'Registration successful'
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          volunteer: {} as Volunteer,
          token: ''
        },
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  async verifyToken(): Promise<ApiResponse<{ user: Volunteer }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: Volunteer }>> = await this.api.get('/api/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token verification failed');
    }
  }

  // Volunteer Management
  async getProfile(): Promise<ApiResponse<Volunteer>> {
    const response: AxiosResponse<ApiResponse<Volunteer>> = await this.api.get('/volunteers/profile');
    return response.data;
  }

  async updateProfile(data: ProfileUpdateData): Promise<ApiResponse<Volunteer>> {
    const response: AxiosResponse<ApiResponse<Volunteer>> = await this.api.put('/volunteers/profile', data);
    return response.data;
  }

  async getAllVolunteers(): Promise<ApiResponse<Volunteer[]>> {
    const response: AxiosResponse<ApiResponse<Volunteer[]>> = await this.api.get('/volunteers');
    return response.data;
  }

  // Event Management
  async getEvents(page: number = 1, limit: number = 10): Promise<ApiResponse<{ events: Event[]; total: number; page: number; totalPages: number }>> {
    const response: AxiosResponse<ApiResponse<{ events: Event[]; total: number; page: number; totalPages: number }>> = await this.api.get(`/events?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    const response: AxiosResponse<ApiResponse<Event>> = await this.api.get(`/events/${id}`);
    return response.data;
  }

  async createEvent(data: EventCreateData): Promise<ApiResponse<Event>> {
    const response: AxiosResponse<ApiResponse<Event>> = await this.api.post('/events', data);
    return response.data;
  }

  async updateEvent(id: string, data: Partial<EventCreateData>): Promise<ApiResponse<Event>> {
    const response: AxiosResponse<ApiResponse<Event>> = await this.api.put(`/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string): Promise<ApiResponse<{ message: string }>> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.api.delete(`/events/${id}`);
    return response.data;
  }

  async registerForEvent(eventId: string): Promise<ApiResponse<{ message: string }>> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.api.post(`/events/${eventId}/register`);
    return response.data;
  }

  // Matching
  async getMatchingEvents(volunteerId: string, limit: number = 10): Promise<ApiResponse<MatchingEvent[]>> {
    const service = await this.getService();
    if (service instanceof MockApiService) {
      return service.getMatchingEvents(volunteerId, limit);
    }
    const response: AxiosResponse<ApiResponse<MatchingEvent[]>> = await this.api.get(`/matching/events/${volunteerId}?limit=${limit}`);
    return response.data;
  }

  async getMatchingVolunteers(eventId: string, limit: number = 20): Promise<ApiResponse<MatchingVolunteer[]>> {
    const response: AxiosResponse<ApiResponse<MatchingVolunteer[]>> = await this.api.get(`/matching/volunteers/${eventId}?limit=${limit}`);
    return response.data;
  }

  async getUrgentAlerts(): Promise<ApiResponse<UrgentAlert[]>> {
    const service = await this.getService();
    if (service instanceof MockApiService) {
      return service.getUrgentAlerts();
    }
    const response: AxiosResponse<ApiResponse<UrgentAlert[]>> = await this.api.get('/matching/alerts');
    return response.data;
  }

  async getMatchingStats(): Promise<ApiResponse<MatchingStats>> {
    const service = await this.getService();
    if (service instanceof MockApiService) {
      return service.getMatchingStats();
    }
    const response: AxiosResponse<ApiResponse<MatchingStats>> = await this.api.get('/matching/stats');
    return response.data;
  }

  async calculateMatchScore(volunteerId: string, eventId: string): Promise<ApiResponse<{ matchScore: number; distance: number }>> {
    const response: AxiosResponse<ApiResponse<{ matchScore: number; distance: number }>> = await this.api.post('/matching/calculate-score', { volunteerId, eventId });
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  removeAuthToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 