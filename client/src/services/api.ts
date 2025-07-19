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
    this.baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
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
      await this.api.get('/');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get the appropriate service (real or mock)
  private async getService() {
    const isAvailable = await this.isBackendAvailable();
    if (!isAvailable) {
      console.warn('Backend not available, using mock data');
      return new MockApiService();
    }
    return this;
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ volunteer: Volunteer; token: string }>> {
    const service = await this.getService();
    if (service instanceof MockApiService) {
      return service.login(credentials);
    }
    const response: AxiosResponse<ApiResponse<{ volunteer: Volunteer; token: string }>> = await this.api.post('/volunteers/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ volunteer: Volunteer; token: string }>> {
    const service = await this.getService();
    if (service instanceof MockApiService) {
      return service.register(data);
    }
    const response: AxiosResponse<ApiResponse<{ volunteer: Volunteer; token: string }>> = await this.api.post('/volunteers/register', data);
    return response.data;
  }

  async verifyToken(): Promise<ApiResponse<{ user: Volunteer }>> {
    const service = await this.getService();
    if (service instanceof MockApiService) {
      return service.verifyToken();
    }
    const response: AxiosResponse<ApiResponse<{ user: Volunteer }>> = await this.api.get('/auth/verify');
    return response.data;
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