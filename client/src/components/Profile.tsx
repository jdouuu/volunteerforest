import { useState, FC } from 'react';
import { User } from '../App';
import NotificationPreferencesComponent from './NotificationPreferences';
import { useNotifications } from '../context/NotificationContext';

interface ProfileProps {
  user: User | null;
}

interface ProfileData {
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  profileImage: string;
}

const Profile: FC<ProfileProps> = ({ user }) => {
  if (!user) return null;

  const { preferences, updatePreferences } = useNotifications();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user.name || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    profileImage: 'https://placehold.co/80x80'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [charCounts, setCharCounts] = useState({
    fullName: user.name?.length || 0,
    address1: 0,
    address2: 0,
    city: 0
  });

  const US_STATES = [
    { value: '', label: 'Select State' },
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (profileData.fullName.length > 50) {
      newErrors.fullName = 'Full name must be 50 characters or less';
    }
    
    if (!profileData.address1.trim()) {
      newErrors.address1 = 'Address is required';
    } else if (profileData.address1.length > 100) {
      newErrors.address1 = 'Address must be 100 characters or less';
    }
    
    if (profileData.address2.length > 100) {
      newErrors.address2 = 'Address must be 100 characters or less';
    }
    
    if (!profileData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (profileData.city.length > 100) {
      newErrors.city = 'City must be 100 characters or less';
    }
    
    if (!profileData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!profileData.zip.trim()) {
      newErrors.zip = 'Zip code is required';
    } else if (profileData.zip.length < 5 || profileData.zip.length > 9) {
      newErrors.zip = 'Zip code must be 5-9 characters';
    }
    
    if (profileData.phone && !/^\d{3}-?\d{3}-?\d{4}$/.test(profileData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number format is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileData, value: string, maxLength?: number) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    if (maxLength && ['fullName', 'address1', 'address2', 'city'].includes(field)) {
      setCharCounts(prev => ({ 
        ...prev, 
        [field]: value.length 
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileData(prev => ({ 
            ...prev, 
            profileImage: e.target!.result as string 
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    console.log('Profile update:', profileData);
    alert('Profile updated successfully!');
  };

  const completionPercentage = () => {
    const fields = [
      profileData.fullName,
      profileData.address1,
      profileData.city,
      profileData.state,
      profileData.zip
    ];
    const filledFields = fields.filter(field => field.trim()).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              {completionPercentage()}% Complete
            </span>
          </div>
        </div>
        
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notification Settings
            </button>
          </nav>
        </div>
        
        {activeTab === 'profile' && (
          <div className="glass-card organic-shadow p-6 mb-8">
            <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <h2 className="text-lg font-medium text-green-700 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="full-name"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value, 50)}
                      maxLength={50}
                      className={`mt-1 block w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {charCounts.fullName}/50 characters
                    </p>
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                  </div>
                  
                  <div className="flex items-end">
                    <div className="mr-4">
                      <img 
                        src={profileData.profileImage} 
                        alt="Current profile picture" 
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor="profile-image" 
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <i className="fas fa-camera mr-2"></i>
                        Change Photo
                      </label>
                      <input
                        type="file"
                        id="profile-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <h2 className="text-lg font-medium text-green-700 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address1" className="block text-sm font-medium text-gray-700">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      id="address1"
                      value={profileData.address1}
                      onChange={(e) => handleInputChange('address1', e.target.value, 100)}
                      maxLength={100}
                      className={`mt-1 block w-full border ${errors.address1 ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {charCounts.address1}/100 characters
                    </p>
                    {errors.address1 && <p className="mt-1 text-sm text-red-600">{errors.address1}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id="address2"
                      value={profileData.address2}
                      onChange={(e) => handleInputChange('address2', e.target.value, 100)}
                      maxLength={100}
                      className={`mt-1 block w-full border ${errors.address2 ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {charCounts.address2}/100 characters
                    </p>
                    {errors.address2 && <p className="mt-1 text-sm text-red-600">{errors.address2}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value, 100)}
                      maxLength={100}
                      className={`mt-1 block w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {charCounts.city}/100 characters
                    </p>
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State *
                    </label>
                    <select
                      id="state"
                      value={profileData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`mt-1 block w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    >
                      {US_STATES.map(state => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      id="zip"
                      value={profileData.zip}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                      maxLength={9}
                      className={`mt-1 block w-full border ${errors.zip ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    />
                    {errors.zip && <p className="mt-1 text-sm text-red-600">{errors.zip}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className={`mt-1 block w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Update Profile
              </button>
            </div>
          </form>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <NotificationPreferencesComponent
            preferences={preferences}
            onUpdatePreferences={updatePreferences}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;