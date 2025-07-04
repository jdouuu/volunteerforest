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

const mockVolunteers = [
    {
      id: 'v1',
      name: 'Sarah Ali',
      skills: ['first aid', 'setup'],
      availability: ['2025-07-05', '2025-07-12'],
    },
    {
      id: 'v2',
      name: 'Ahmed Khan',
      skills: ['gardening', 'event planning'],
      availability: ['2025-07-10', '2025-07-15'],
    },
    {
      id: 'v3',
      name: 'Lisa Carter',
      skills: ['cooking', 'communication'],
      availability: ['2025-07-07', '2025-07-14'],
    },
    {
      id: 'v4',
      name: 'John Lee',
      skills: ['teaching', 'technical skills'],
      availability: ['2025-07-05', '2025-07-10'],
    },
    {
      id: 'v5',
      name: 'Maria Gomez',
      skills: ['organization', 'customer service'],
      availability: ['2025-07-06', '2025-07-09'],
    },
    {
      id: 'v6',
      name: 'James Patel',
      skills: ['physical labor', 'environmental awareness'],
      availability: ['2025-07-11', '2025-07-16'],
    }
  ];

const [mockEvents, setEvents] = useState<Event[]>([
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