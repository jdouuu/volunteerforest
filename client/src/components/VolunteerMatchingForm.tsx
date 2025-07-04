import React, { useState } from 'react';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  skills: string[];
  availability: string[];
  experience: string;
  preferredType: string;
  location: string;
}

interface Event {
  id: string;
  name: string;
  requiredSkills: string[];
  date: string;
  time: string;
  location: string;
  description: string;
  volunteersNeeded: number;
  currentVolunteers: number;
  priority: 'low' | 'medium' | 'high';
}

interface Match {
  volunteer: Volunteer;
  event: Event;
  matchScore: number;
  matchReasons: string[];
}

const mockVolunteers: Volunteer[] = [
  {
    id: '1',
    name: 'Sarah Ali',
    email: 'sarah.ali@email.com',
    skills: ['first aid', 'setup', 'communication'],
    availability: ['2025-07-05', '2025-07-06', '2025-07-07', '2025-07-10', '2025-07-11'],
    experience: '2 years',
    preferredType: 'healthcare',
    location: 'Downtown'
  },
  {
    id: '2',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@email.com',
    skills: ['gardening', 'event planning', 'physical labor'],
    availability: ['2025-07-05', '2025-07-10', '2025-07-11', '2025-07-15'],
    experience: '3 years',
    preferredType: 'environmental',
    location: 'Northside'
  },
  {
    id: '3',
    name: 'Lisa Carter',
    email: 'lisa.carter@email.com',
    skills: ['cooking', 'communication', 'organization'],
    availability: ['2025-07-06', '2025-07-07', '2025-07-10', '2025-07-11'],
    experience: '1 year',
    preferredType: 'social services',
    location: 'Westside'
  },
  {
    id: '4',
    name: 'John Lee',
    email: 'john.lee@email.com',
    skills: ['teaching', 'technical skills', 'patience'],
    availability: ['2025-07-05', '2025-07-10', '2025-07-11'],
    experience: '4 years',
    preferredType: 'education',
    location: 'Downtown'
  },
  {
    id: '5',
    name: 'Maria Gomez',
    email: 'maria.gomez@email.com',
    skills: ['organization', 'customer service', 'leadership'],
    availability: ['2025-07-06', '2025-07-07', '2025-07-10'],
    experience: '5 years',
    preferredType: 'community',
    location: 'Eastside'
  },
  {
    id: '6',
    name: 'James Patel',
    email: 'james.patel@email.com',
    skills: ['physical labor', 'environmental awareness', 'teamwork'],
    availability: ['2025-07-05', '2025-07-11', '2025-07-06'],
    experience: '2 years',
    preferredType: 'environmental',
    location: 'Southside'
  },
  {
    id: '7',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@email.com',
    skills: ['customer service', 'organization', 'communication'],
    availability: ['2025-07-06', '2025-07-07', '2025-07-10'],
    experience: '3 years',
    preferredType: 'community',
    location: 'Downtown'
  },
  {
    id: '8',
    name: 'David Chen',
    email: 'david.chen@email.com',
    skills: ['technical skills', 'teaching', 'problem solving'],
    availability: ['2025-07-10', '2025-07-11'],
    experience: '6 years',
    preferredType: 'education',
    location: 'Northside'
  }
];

const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Community Garden Planting',
    requiredSkills: ['gardening', 'physical labor'],
    date: '2025-07-05',
    time: '9:00 AM - 1:00 PM',
    location: 'Downtown Community Garden',
    description: 'Help plant seasonal vegetables and flowers in our community garden',
    volunteersNeeded: 8,
    currentVolunteers: 3,
    priority: 'high'
  },
  {
    id: '2',
    name: 'Senior Center Tech Workshop',
    requiredSkills: ['teaching', 'technical skills', 'patience'],
    date: '2025-07-10',
    time: '2:00 PM - 4:00 PM',
    location: 'Northside Senior Center',
    description: 'Teach seniors basic computer and smartphone skills',
    volunteersNeeded: 4,
    currentVolunteers: 1,
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Food Bank Distribution',
    requiredSkills: ['organization', 'customer service', 'physical labor'],
    date: '2025-07-06',
    time: '8:00 AM - 12:00 PM',
    location: 'Westside Food Bank',
    description: 'Sort and distribute food packages to families in need',
    volunteersNeeded: 12,
    currentVolunteers: 7,
    priority: 'high'
  },
  {
    id: '4',
    name: 'River Cleanup Initiative',
    requiredSkills: ['environmental awareness', 'physical labor'],
    date: '2025-07-11',
    time: '10:00 AM - 2:00 PM',
    location: 'Riverside Park',
    description: 'Remove trash and debris from the riverbank and surrounding areas',
    volunteersNeeded: 15,
    currentVolunteers: 8,
    priority: 'high'
  },
  {
    id: '5',
    name: 'Homeless Shelter Meal Service',
    requiredSkills: ['cooking', 'customer service', 'communication'],
    date: '2025-07-07',
    time: '5:00 PM - 8:00 PM',
    location: 'Downtown Homeless Shelter',
    description: 'Prepare and serve meals to homeless individuals and families',
    volunteersNeeded: 6,
    currentVolunteers: 4,
    priority: 'medium'
  }
];

const VolunteerMatchingForm: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'event-first' | 'volunteer-first' | 'auto-match'>('auto-match');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [autoMatches, setAutoMatches] = useState<Match[]>([]);
  const [manualAssignments, setManualAssignments] = useState<{volunteerId: string, eventId: string}[]>([]);

  const calculateMatchScore = (volunteer: Volunteer, event: Event): number => {
    let score = 0;
    
    // Skill matching (40% of score)
    const skillMatches = event.requiredSkills.filter(skill => volunteer.skills.includes(skill));
    score += (skillMatches.length / event.requiredSkills.length) * 40;
    
    // Availability matching (30% of score)
    if (volunteer.availability.includes(event.date)) {
      score += 30;
    }
    
    // Experience bonus (20% of score)
    const experienceYears = parseInt(volunteer.experience);
    if (experienceYears >= 3) score += 20;
    else if (experienceYears >= 1) score += 10;
    
    // Priority bonus (10% of score)
    if (event.priority === 'high') score += 10;
    else if (event.priority === 'medium') score += 5;
    
    return Math.min(score, 100);
  };

  const generateAutoMatches = () => {
    const matches: Match[] = [];
    
    mockVolunteers.forEach(volunteer => {
      mockEvents.forEach(event => {
        if (volunteer.availability.includes(event.date)) {
          const matchScore = calculateMatchScore(volunteer, event);
          if (matchScore >= 30) { // Only show matches with 30%+ compatibility
            const skillMatches = event.requiredSkills.filter(skill => volunteer.skills.includes(skill));
            const matchReasons = [
              `${skillMatches.length}/${event.requiredSkills.length} required skills match`,
              `Available on ${event.date}`,
              `${volunteer.experience} experience`,
              `Located in ${volunteer.location}`
            ];
            
            matches.push({
              volunteer,
              event,
              matchScore,
              matchReasons
            });
          }
        }
      });
    });
    
    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);
    setAutoMatches(matches);
  };

  const handleVolunteerSelect = (volunteerId: string) => {
    const volunteer = mockVolunteers.find(v => v.id === volunteerId);
    setSelectedVolunteer(volunteer || null);
  };

  const handleEventSelect = (eventId: string) => {
    const event = mockEvents.find(e => e.id === eventId);
    setSelectedEvent(event || null);
  };

  const assignVolunteerToEvent = (volunteerId: string, eventId: string) => {
    setManualAssignments(prev => [...prev, { volunteerId, eventId }]);
  };

  const removeAssignment = (volunteerId: string, eventId: string) => {
    setManualAssignments(prev => prev.filter(a => !(a.volunteerId === volunteerId && a.eventId === eventId)));
  };

  const getEventVolunteers = (eventId: string) => {
    return manualAssignments.filter(a => a.eventId === eventId);
  };

  const getVolunteerEvents = (volunteerId: string) => {
    return manualAssignments.filter(a => a.volunteerId === volunteerId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  React.useEffect(() => {
    if (selectedView === 'auto-match') {
      generateAutoMatches();
    }
  }, [selectedView]);

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Matching Center</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('auto-match')}
            className={`px-4 py-2 rounded-md font-medium ${
              selectedView === 'auto-match'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Smart Matching
          </button>
          <button
            onClick={() => setSelectedView('event-first')}
            className={`px-4 py-2 rounded-md font-medium ${
              selectedView === 'event-first'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Event First
          </button>
          <button
            onClick={() => setSelectedView('volunteer-first')}
            className={`px-4 py-2 rounded-md font-medium ${
              selectedView === 'volunteer-first'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Volunteer First
          </button>
        </div>
      </div>

      {selectedView === 'auto-match' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-lightbulb text-blue-500"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900">Smart Matching Algorithm</h3>
                <p className="text-sm text-blue-700">
                  Our matching system analyzes volunteer skills, availability, experience, and event priority to suggest optimal matches.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <h2 className="text-xl font-semibold text-gray-900">Recommended Matches</h2>
            {autoMatches.length > 0 ? (
              <div className="space-y-4">
                {autoMatches.slice(0, 10).map((match, index) => (
                  <div key={`${match.volunteer.id}-${match.event.id}`} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{match.volunteer.name}</h3>
                            <p className="text-sm text-gray-500">{match.volunteer.email}</p>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getMatchScoreColor(match.matchScore)}`}>
                              {match.matchScore.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">Match Score</div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{match.event.name}</h3>
                            <p className="text-sm text-gray-500">{match.event.date} • {match.event.time}</p>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(match.event.priority)}`}>
                        {match.event.priority} priority
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Volunteer Details:</p>
                        <p className="text-sm text-gray-600">Skills: {match.volunteer.skills.join(', ')}</p>
                        <p className="text-sm text-gray-600">Experience: {match.volunteer.experience}</p>
                        <p className="text-sm text-gray-600">Location: {match.volunteer.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Event Details:</p>
                        <p className="text-sm text-gray-600">Required: {match.event.requiredSkills.join(', ')}</p>
                        <p className="text-sm text-gray-600">Volunteers: {match.event.currentVolunteers}/{match.event.volunteersNeeded}</p>
                        <p className="text-sm text-gray-600">Location: {match.event.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {match.matchReasons.map((reason, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {reason}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => assignVolunteerToEvent(match.volunteer.id, match.event.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                        disabled={getVolunteerEvents(match.volunteer.id).some(a => a.eventId === match.event.id)}
                      >
                        {getVolunteerEvents(match.volunteer.id).some(a => a.eventId === match.event.id) ? 'Assigned' : 'Assign Match'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No matches found. Try adjusting the matching criteria.</p>
            )}
          </div>
        </div>
      )}

      {selectedView === 'event-first' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Event</h2>
            <div className="space-y-3">
              {mockEvents.map(event => (
                <div
                  key={event.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleEventSelect(event.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-500">{event.date} • {event.time}</p>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                        {event.priority}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {event.currentVolunteers + getEventVolunteers(event.id).length}/{event.volunteersNeeded}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Volunteers</h2>
            {selectedEvent ? (
              <div className="space-y-3">
                {mockVolunteers
                  .filter(volunteer => volunteer.availability.includes(selectedEvent.date))
                  .map(volunteer => {
                    const matchScore = calculateMatchScore(volunteer, selectedEvent);
                    const isAssigned = getVolunteerEvents(volunteer.id).some(a => a.eventId === selectedEvent.id);
                    
                    return (
                      <div key={volunteer.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{volunteer.name}</h3>
                            <p className="text-sm text-gray-500">{volunteer.email}</p>
                            <p className="text-sm text-gray-600">Skills: {volunteer.skills.join(', ')}</p>
                            <p className="text-sm text-gray-600">Experience: {volunteer.experience}</p>
                          </div>
                          <div className="ml-4 text-right">
                            <div className={`text-lg font-bold ${getMatchScoreColor(matchScore)}`}>
                              {matchScore.toFixed(0)}%
                            </div>
                            <button
                              onClick={() => 
                                isAssigned 
                                  ? removeAssignment(volunteer.id, selectedEvent.id)
                                  : assignVolunteerToEvent(volunteer.id, selectedEvent.id)
                              }
                              className={`mt-2 px-3 py-1 rounded-md text-sm font-medium ${
                                isAssigned
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {isAssigned ? 'Remove' : 'Assign'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500">Select an event to see available volunteers.</p>
            )}
          </div>
        </div>
      )}

      {selectedView === 'volunteer-first' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Volunteer</h2>
            <div className="space-y-3">
              {mockVolunteers.map(volunteer => (
                <div
                  key={volunteer.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedVolunteer?.id === volunteer.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleVolunteerSelect(volunteer.id)}
                >
                  <h3 className="font-medium text-gray-900">{volunteer.name}</h3>
                  <p className="text-sm text-gray-500">{volunteer.email}</p>
                  <p className="text-sm text-gray-600">Skills: {volunteer.skills.join(', ')}</p>
                  <p className="text-sm text-gray-600">Experience: {volunteer.experience} • {volunteer.location}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Matching Events</h2>
            {selectedVolunteer ? (
              <div className="space-y-3">
                {mockEvents
                  .filter(event => selectedVolunteer.availability.includes(event.date))
                  .map(event => {
                    const matchScore = calculateMatchScore(selectedVolunteer, event);
                    const isAssigned = getVolunteerEvents(selectedVolunteer.id).some(a => a.eventId === event.id);
                    
                    return (
                      <div key={event.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{event.name}</h3>
                            <p className="text-sm text-gray-500">{event.date} • {event.time}</p>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            <p className="text-sm text-gray-600">Required: {event.requiredSkills.join(', ')}</p>
                          </div>
                          <div className="ml-4 text-right">
                            <div className={`text-lg font-bold ${getMatchScoreColor(matchScore)}`}>
                              {matchScore.toFixed(0)}%
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(event.priority)} mt-1`}>
                              {event.priority}
                            </span>
                            <button
                              onClick={() => 
                                isAssigned 
                                  ? removeAssignment(selectedVolunteer.id, event.id)
                                  : assignVolunteerToEvent(selectedVolunteer.id, event.id)
                              }
                              className={`mt-2 px-3 py-1 rounded-md text-sm font-medium ${
                                isAssigned
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {isAssigned ? 'Remove' : 'Assign'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500">Select a volunteer to see matching events.</p>
            )}
          </div>
        </div>
      )}

      {manualAssignments.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Assignments ({manualAssignments.length})</h3>
          <div className="space-y-2">
            {manualAssignments.map((assignment, index) => {
              const volunteer = mockVolunteers.find(v => v.id === assignment.volunteerId);
              const event = mockEvents.find(e => e.id === assignment.eventId);
              
              return (
                <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{volunteer?.name}</span>
                    <span className="text-gray-500 mx-2">→</span>
                    <span className="font-medium text-gray-900">{event?.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({event?.date})</span>
                  </div>
                  <button
                    onClick={() => removeAssignment(assignment.volunteerId, assignment.eventId)}
                    className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-right">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700">
              Save All Assignments
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerMatchingForm;