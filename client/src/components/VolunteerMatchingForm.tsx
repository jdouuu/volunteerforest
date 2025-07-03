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
    name: "Sarah Ali",
    skills: ["First Aid", "Setup"],
    availability: ["2025-07-05", "2025-07-12"]
  },
  {
    name: "Ahmed Khan",
    skills: ["Gardening", "Customer Service"],
    availability: ["2025-07-10", "2025-07-17"]
  }
];

const mockEvents: Event[] = [
  {
    name: "Health Drive",
    requiredSkills: ["First Aid"],
    date: "2025-07-05"
  },
  {
    name: "Mosque Cleanup",
    requiredSkills: ["Setup"],
    date: "2025-07-10"
  },
  {
    name: "Food Bank",
    requiredSkills: ["Customer Service"],
    date: "2025-07-17"
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