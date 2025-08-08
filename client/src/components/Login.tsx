import { useState, FC } from 'react';
import { useAuth } from '../context/AuthContext';

const Login: FC = () => {
  const { login, register, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'volunteer' | 'admin'>('volunteer');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isRegistering && !name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clear any previous auth errors
    clearError();
    setErrors({});

    try {
      if (isRegistering) {
        // Registration
        const result = await register(name, email, password, role);
        if (result.success) {
          setShowSuccessMessage(true);
          setIsRegistering(false);
          setEmail('');
          setPassword('');
          setName('');
          setRole('volunteer');
          setErrors({});
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 5000);
        } else {
          setErrors({ general: result.message || 'Registration failed. Please try again.' });
        }
      } else {
        // Login
        const result = await login(email, password, role);
        if (!result.success) {
          setErrors({ general: result.message || 'Invalid email or password.' });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass-card organic-shadow p-8 rounded-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
          {isRegistering ? 'Join VolunteerMatch' : 'Welcome to VolunteerMatch'}
        </h2>
        
        {showSuccessMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              <span>Registration successful! Please login with your credentials.</span>
            </div>
          </div>
        )}
        
        {(errors.general || error) && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{errors.general || error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 block w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500`}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              {isRegistering ? 'Account Type' : 'Login As'}
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'volunteer' | 'admin')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="volunteer">Volunteer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {!isRegistering && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                  Forgot password?
                </a>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isRegistering ? 'Create Account' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Social login buttons removed for clarity */}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setShowSuccessMessage(false);
                setErrors({});
              }}
              className="font-medium text-green-600 hover:text-green-500"
            >
              {isRegistering ? 'Sign in here' : 'Register here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
