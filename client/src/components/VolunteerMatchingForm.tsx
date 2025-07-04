import React, { useState } from 'react';

interface Volunteer {
  name: string;
  skills: string[];
  availability: string[]; // e.g., ["2025-07-05", "2025-07-12"]
}

interface Event {
  name: string;
  requiredSkills: string[];
  date: string;
}

const mockVolunteers: Volunteer[] = [
  {
    name: 'Sarah Ali',
    skills: ['first aid', 'setup'],
    availability: ['2025-07-05', '2025-07-12'],
  },
  {
    name: 'Ahmed Khan',
    skills: ['gardening', 'event planning'],
    availability: ['2025-07-10', '2025-07-15'],
  },
  {
    name: 'Lisa Carter',
    skills: ['cooking', 'communication'],
    availability: ['2025-07-07', '2025-07-14'],
  },
  {
    name: 'John Lee',
    skills: ['teaching', 'technical skills'],
    availability: ['2025-07-05', '2025-07-10'],
  },
  {
    name: 'Maria Gomez',
    skills: ['organization', 'customer service'],
    availability: ['2025-07-06', '2025-07-09'],
  },
  {
    name: 'James Patel',
    skills: ['physical labor', 'environmental awareness'],
    availability: ['2025-07-11', '2025-07-16'],
  }
];

const mockEvents: Event[] = [
    {
      name: 'Community Garden Planting',
      requiredSkills: ['gardening', 'physical labor'],
      date: '2025-07-05',
    },
    {
      name: 'Riverside Cleanup',
      requiredSkills: ['physical labor', 'environmental awareness'],
      date: '2025-07-11',
    },
    {
      name: 'Tree Planting Initiative',
      requiredSkills: ['physical labor', 'gardening'],
      date: '2025-07-12',
    },
    {
      name: 'Beach Cleanup Day',
      requiredSkills: ['physical labor', 'environmental awareness'],
      date: '2025-07-13',
    },
    {
      name: 'Recycling Education Workshop',
      requiredSkills: ['teaching', 'communication'],
      date: '2025-07-14',
    },
    {
      name: 'Food Bank Distribution',
      requiredSkills: ['customer service', 'organization'],
      date: '2025-07-06',
    },
    {
      name: 'Senior Center Social Hour',
      requiredSkills: ['communication', 'patience'],
      date: '2025-07-07',
    },
    {
      name: 'Homeless Shelter Meal Service',
      requiredSkills: ['cooking', 'customer service'],
      date: '2025-07-10',
    },
    {
      name: 'Community Blood Drive',
      requiredSkills: ['organization', 'customer service'],
      date: '2025-07-15',
    },
    {
      name: 'Neighborhood Watch Meeting',
      requiredSkills: ['organization', 'communication'],
      date: '2025-07-16',
    },
    {
      name: 'After-School Tutoring Program',
      requiredSkills: ['teaching', 'patience'],
      date: '2025-07-09',
    },
    {
      name: 'Computer Skills Workshop',
      requiredSkills: ['technical skills', 'teaching'],
      date: '2025-07-07',
    },
    {
      name: 'Reading Buddies Program',
      requiredSkills: ['communication', 'patience'],
      date: '2025-07-08',
    },
    {
      name: 'Science Fair Mentoring',
      requiredSkills: ['teaching', 'technical skills'],
      date: '2025-07-05',
    },
    {
      name: 'ESL Conversation Group',
      requiredSkills: ['communication', 'patience'],
      date: '2025-07-11',
    },
    {
      name: 'Health Fair Support',
      requiredSkills: ['organization', 'customer service'],
      date: '2025-07-06',
    },
    {
      name: 'Mental Health Awareness Walk',
      requiredSkills: ['communication', 'organization'],
      date: '2025-07-10',
    },
    {
      name: 'First Aid Training Assistant',
      requiredSkills: ['first aid', 'teaching'],
      date: '2025-07-12',
    },
    {
      name: 'Hospital Gift Shop Volunteer',
      requiredSkills: ['customer service', 'organization'],
      date: '2025-07-09',
    },
    {
      name: 'Fitness Class for Seniors',
      requiredSkills: ['teaching', 'first aid'],
      date: '2025-07-11',
    },
    {
      name: 'Animal Shelter Care',
      requiredSkills: ['physical labor', 'patience'],
      date: '2025-07-15',
    },
    {
      name: 'Historical Museum Guide',
      requiredSkills: ['communication', 'organization'],
      date: '2025-07-13',
    },
    {
      name: 'Community Theater Support',
      requiredSkills: ['technical skills', 'organization'],
      date: '2025-07-10',
    },
    {
      name: 'Disaster Relief Training',
      requiredSkills: ['first aid', 'organization'],
      date: '2025-07-14',
    },
    {
      name: 'Community Newsletter',
      requiredSkills: ['communication', 'organization'],
      date: '2025-07-09',
    }
  ];

const VolunteerMatchingForm: React.FC = () => {
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [matchedEvents, setMatchedEvents] = useState<Event[]>([]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const volunteer = mockVolunteers.find(v => v.name === name);
    setSelectedVolunteer(volunteer);

    if (volunteer) {
      const matches = mockEvents.filter(event =>
        event.requiredSkills.some(skill => volunteer.skills.includes(skill)) &&
        volunteer.availability.includes(event.date)
      );
      setMatchedEvents(matches);
    } else {
      setMatchedEvents([]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Volunteer Matching</h2>

      <label className="block mb-2 text-gray-700 font-medium">Select a Volunteer:</label>
      <select
        onChange={handleSelect}
        className="w-full p-2 border rounded-md mb-4"
        defaultValue=""
      >
        <option value="" disabled>Select...</option>
        {mockVolunteers.map((v) => (
          <option key={v.name} value={v.name}>{v.name}</option>
        ))}
      </select>

      {selectedVolunteer && (
        <div className="mb-6">
          <p><strong>Skills:</strong> {selectedVolunteer.skills.join(", ")}</p>
          <p><strong>Availability:</strong> {selectedVolunteer.availability.join(", ")}</p>
        </div>
      )}

      {matchedEvents.length > 0 ? (
        <div>
          <h3 className="text-xl font-semibold mb-2">Matched Events:</h3>
          <ul className="space-y-2">
            {matchedEvents.map((event) => (
              <li key={event.name} className="p-4 bg-green-100 rounded">
                <strong>{event.name}</strong> – {event.date}<br />
                <em>Skills Needed:</em> {event.requiredSkills.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      ) : selectedVolunteer ? (
        <p className="text-red-500">No events match this volunteer’s profile.</p>
      ) : null}
    </div>
  );
};

export default VolunteerMatchingForm;