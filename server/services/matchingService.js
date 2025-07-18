const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');

class MatchingService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  /**
   * Calculate skill match score between volunteer and event
   */
  calculateSkillMatch(volunteerSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 1.0;
    if (!volunteerSkills || volunteerSkills.length === 0) return 0.0;
    
    const matchingSkills = volunteerSkills.filter(skill => 
      requiredSkills.includes(skill)
    );
    return matchingSkills.length / requiredSkills.length;
  }

  /**
   * Check availability match between volunteer and event
   */
  checkAvailabilityMatch(volunteerAvailability, eventDate) {
    const eventDay = eventDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const eventHour = eventDate.getHours();
    
    // Determine if it's a weekday or weekend
    const isWeekend = eventDay === 0 || eventDay === 6;
    const availability = isWeekend ? volunteerAvailability.weekends : volunteerAvailability.weekdays;
    
    // Determine time of day
    let timeSlot;
    if (eventHour < 12) timeSlot = 'morning';
    else if (eventHour < 17) timeSlot = 'afternoon';
    else timeSlot = 'evening';
    
    return availability[timeSlot] || false;
  }

  /**
   * Calculate overall match score between volunteer and event
   */
  calculateMatchScore(volunteer, event) {
    let score = 0;
    const weights = {
      skillMatch: 0.4,
      availability: 0.3,
      distance: 0.2,
      preferences: 0.1
    };

    // Skill match (40% weight)
    const skillMatch = this.calculateSkillMatch(volunteer.skills, event.requiredSkills);
    score += skillMatch * weights.skillMatch;

    // Availability match (30% weight)
    const availabilityMatch = this.checkAvailabilityMatch(volunteer.availability, event.startDate) ? 1 : 0;
    score += availabilityMatch * weights.availability;

    // Distance match (20% weight)
    if (volunteer.location.coordinates && event.location.coordinates) {
      const distance = this.calculateDistance(
        volunteer.location.coordinates.lat,
        volunteer.location.coordinates.lng,
        event.location.coordinates.lat,
        event.location.coordinates.lng
      );
      
      // Convert distance to score (closer = higher score)
      const maxDistance = volunteer.preferences.maxDistance || 10;
      const distanceScore = Math.max(0, 1 - (distance / maxDistance));
      score += distanceScore * weights.distance;
    } else {
      // If no coordinates, assume moderate distance
      score += 0.5 * weights.distance;
    }

    // Preference match (10% weight)
    const preferenceMatch = volunteer.preferences.eventTypes.includes(event.eventType) ? 1 : 0;
    score += preferenceMatch * weights.preferences;

    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Find matching events for a specific volunteer
   */
  async findMatchingEvents(volunteerId, limit = 10) {
    try {
      const volunteer = await Volunteer.findById(volunteerId);
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      // Get available events
      const availableEvents = await Event.find({
        status: 'upcoming',
        currentVolunteers: { $lt: '$maxVolunteers' }
      });

      // Calculate match scores for each event
      const eventsWithScores = availableEvents.map(event => {
        const matchScore = this.calculateMatchScore(volunteer, event);
        return {
          event,
          matchScore,
          distance: volunteer.location.coordinates && event.location.coordinates 
            ? this.calculateDistance(
                volunteer.location.coordinates.lat,
                volunteer.location.coordinates.lng,
                event.location.coordinates.lat,
                event.location.coordinates.lng
              )
            : null
        };
      });

      // Sort by match score (highest first) and filter out low matches
      const filteredEvents = eventsWithScores
        .filter(item => item.matchScore > 0.3) // Only show events with >30% match
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      return filteredEvents;
    } catch (error) {
      throw new Error(`Error finding matching events: ${error.message}`);
    }
  }

  /**
   * Find matching volunteers for a specific event
   */
  async findMatchingVolunteers(eventId, limit = 20) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Get active volunteers
      const volunteers = await Volunteer.find({ isActive: true });

      // Calculate match scores for each volunteer
      const volunteersWithScores = volunteers.map(volunteer => {
        const matchScore = this.calculateMatchScore(volunteer, event);
        return {
          volunteer,
          matchScore,
          distance: volunteer.location.coordinates && event.location.coordinates 
            ? this.calculateDistance(
                volunteer.location.coordinates.lat,
                volunteer.location.coordinates.lng,
                event.location.coordinates.lat,
                event.location.coordinates.lng
              )
            : null
        };
      });

      // Sort by match score (highest first) and filter out low matches
      const filteredVolunteers = volunteersWithScores
        .filter(item => item.matchScore > 0.3) // Only show volunteers with >30% match
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      return filteredVolunteers;
    } catch (error) {
      throw new Error(`Error finding matching volunteers: ${error.message}`);
    }
  }

  /**
   * Get urgent matching alerts (events with low volunteer count)
   */
  async getUrgentMatchingAlerts() {
    try {
      const urgentEvents = await Event.find({
        status: 'upcoming',
        $expr: {
          $lt: ['$currentVolunteers', { $multiply: ['$maxVolunteers', 0.5] }] // Less than 50% filled
        }
      }).sort({ startDate: 1 }); // Sort by earliest first

      const alerts = [];
      
      for (const event of urgentEvents) {
        const availableSpots = event.getAvailableSpots();
        const daysUntilEvent = event.daysUntilEvent();
        
        if (daysUntilEvent <= 7 && availableSpots > 0) {
          alerts.push({
            event,
            availableSpots,
            daysUntilEvent,
            urgency: daysUntilEvent <= 3 ? 'high' : 'medium'
          });
        }
      }

      return alerts;
    } catch (error) {
      throw new Error(`Error getting urgent matching alerts: ${error.message}`);
    }
  }

  /**
   * Get matching statistics for dashboard
   */
  async getMatchingStats() {
    try {
      const totalVolunteers = await Volunteer.countDocuments({ isActive: true });
      const totalEvents = await Event.countDocuments({ status: 'upcoming' });
      const urgentEvents = await Event.countDocuments({
        status: 'upcoming',
        $expr: {
          $lt: ['$currentVolunteers', { $multiply: ['$maxVolunteers', 0.5] }]
        }
      });

      return {
        totalVolunteers,
        totalEvents,
        urgentEvents,
        pendingMatches: urgentEvents
      };
    } catch (error) {
      throw new Error(`Error getting matching stats: ${error.message}`);
    }
  }
}

module.exports = new MatchingService(); 