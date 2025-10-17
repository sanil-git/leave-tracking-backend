import React, { useState, useEffect, useCallback, useTransition, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Register from './components/Register';
import Header from './components/Header';
import Home from './pages/Home';
import NotificationBell from './components/NotificationBell';
import SkipNavigation from './components/ui/SkipNavigation';
import LanguageToggle from './components/LanguageToggle';
import './App.css';
import './index.css';
import './calendar-tailwind.css'; // Beautiful calendar styling

// Lazy load dashboard components for better performance
const Calendar = React.lazy(() => import('./components/dashboard/Calendar'));
const LeaveForm = React.lazy(() => import('./components/dashboard/LeaveForm'));
const HolidayManager = React.lazy(() => import('./components/dashboard/HolidayManager'));
const Insights = React.lazy(() => import('./components/dashboard/Insights'));
const MyTeam = React.lazy(() => import('./components/dashboard/MyTeam'));
const AdminPanel = React.lazy(() => import('./components/dashboard/AdminPanel'));

// Preload MyTeam component for faster navigation
const preloadMyTeam = () => import('./components/dashboard/MyTeam');

// Team data prefetching function
const prefetchTeamData = async (token) => {
  if (!token) return;
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : 'https://leave-tracking-backend.onrender.com');

  try {
    // Prefetch team data in background
    const promises = [
      fetch(`${API_BASE_URL}/api/teams/my-team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_BASE_URL}/api/leaves/pending`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }),
      fetch(`${API_BASE_URL}/api/users/temp-passwords`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
    ];
    
    await Promise.allSettled(promises);
    console.log('Team data prefetched successfully');
  } catch (error) {
    console.log('Team data prefetch failed:', error);
  }
};

// Move API_BASE_URL outside component to avoid dependency issues
// Auto-detect: use localhost for development, production backend for production
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://leave-tracking-backend.onrender.com');

function App() {
  const { user, token, loading, login, logout } = useAuth();
  const { t } = useTranslation();
  
  // Reset showLogin state when user logs out
  useEffect(() => {
    if (!user && !loading) {
      setShowLogin(null);
    }
  }, [user, loading]);
  const [officialHolidays, setOfficialHolidays] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [showLogin, setShowLogin] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [, startHolidayTransition] = useTransition();
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard' or 'team'
  
  // Team data prefetching state
  const [teamDataPrefetched, setTeamDataPrefetched] = useState(false);
  
  // AI Insights state
  const [aiInsights, setAiInsights] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [aiError, setAiError] = useState({});
  const [aiInsightsFetched, setAiInsightsFetched] = useState(false);
  const [initialDataFetched, setInitialDataFetched] = useState(false);
  
  // Weather AI state
  const [weatherData, setWeatherData] = useState({});
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [allWeatherData, setAllWeatherData] = useState({});
  // Loading states temporarily disabled to fix infinite loading issue

  // Simple fetch functions - no complex dependencies
  const fetchOfficialHolidays = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/holidays`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setOfficialHolidays(data);
      }
      return response.ok; // Always return a value
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return false; // Return false on error
    }
  }, [token]);
  
  const fetchVacations = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/vacations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        const previousVacations = vacations;
        setVacations(data);
        
        // Only reset AI flag if vacations actually changed (different length or content)
        if (previousVacations.length !== data.length || 
            JSON.stringify(previousVacations.map(v => v._id)) !== JSON.stringify(data.map(v => v._id))) {
          setAiInsightsFetched(false);
        }
      } else {
        console.error('Failed to fetch vacations:', response.status, response.statusText);
      }
      return response.ok; // Always return a value
    } catch (error) {
      console.error('Error fetching vacations:', error);
      return false; // Return false on error
    }
  }, [token, vacations]);
  
  const fetchLeaveBalances = useCallback(async () => {
    try {
      if (!token) {
        console.error('No token available for leave balances request');
        return false; // Return false when no token
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/leave-balances`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle different possible data formats
        let processedData = data;
        if (Array.isArray(data)) {
          // If it's an array, convert to object format
          processedData = data.reduce((acc, item) => {
            acc[item.leaveType] = item.balance;
            return acc;
          }, {});
        } else if (data && typeof data === 'object') {
          // If it's already an object, use as is
          processedData = data;
        } else {
          // No valid data found
          processedData = {};
        }
        
        setLeaveBalances(processedData);
      } else {
        console.error('Failed to fetch leave balances:', response.status, response.statusText);
      }
      return response.ok; // Always return a value
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      return false; // Return false on error
    }
  }, [token]);

  // AI Insights fetching function
  const fetchAIInsights = useCallback(async () => {
    if (!token) return;
    
    // Filter for future vacations with destinations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureVacations = vacations.filter(vacation => {
      const vacationDate = new Date(vacation.fromDate || vacation.startDate);
      return vacationDate >= today && vacation.destination;
    });
    
    if (futureVacations.length === 0) return;
    
    // Process each future vacation
    for (const vacation of futureVacations) {
      if (!vacation.destination || !vacation.fromDate || !vacation.toDate) continue;
      
      const vacationId = vacation._id || vacation.name;
      
      setAiLoading(prev => ({ ...prev, [vacationId]: true }));
      setAiError(prev => ({ ...prev, [vacationId]: null }));
      
      try {
        // 30 second timeout to prevent getting stuck
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(`${API_BASE_URL}/api/vacation-insights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            vacationId: vacation._id,
            startDate: vacation.fromDate,
            endDate: vacation.toDate,
            destination: vacation.destination,
            vacationName: vacation.name
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setAiInsights(prev => ({ ...prev, [vacationId]: data }));
        } else {
          setAiError(prev => ({ ...prev, [vacationId]: 'Failed to get AI insights' }));
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          setAiError(prev => ({ ...prev, [vacationId]: 'Request timed out (30s)' }));
        } else {
          setAiError(prev => ({ ...prev, [vacationId]: 'AI service unavailable' }));
        }
        console.error('AI insights error:', err);
      } finally {
        setAiLoading(prev => ({ ...prev, [vacationId]: false }));
      }
    }
  }, [token, vacations]);

  // Weather AI fetch function - now fetches weather for ALL vacations
  const fetchWeatherForecast = useCallback(async () => {
    if (!token) return;
    
    // Filter for future vacations with destinations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureVacations = vacations.filter(vacation => {
      const vacationDate = new Date(vacation.fromDate || vacation.startDate);
      return vacationDate >= today && vacation.destination;
    });
    
    if (futureVacations.length === 0) return;
    
    setWeatherLoading(true);
    setWeatherError(null);
    
    // Fetch weather for ALL future vacations
    const weatherPromises = futureVacations.map(async (vacation) => {
      if (!vacation.destination || !vacation.fromDate || !vacation.toDate) return null;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(`${API_BASE_URL}/api/weather-forecast`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            destination: vacation.destination,
            startDate: vacation.fromDate,
            endDate: vacation.toDate
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const weather = await response.json();
          return {
            vacationId: vacation._id || vacation.name,
            vacation: vacation,
            weather: weather
          };
        } else {
          console.error(`Weather forecast failed for ${vacation.destination}:`, response.status);
          return null;
        }
      } catch (error) {
        console.error(`Weather forecast error for ${vacation.destination}:`, error);
        return null;
      }
    });
    
    try {
      const weatherResults = await Promise.all(weatherPromises);
      const validResults = weatherResults.filter(result => result !== null);
      
      // Store all weather data
      const weatherDataMap = {};
      validResults.forEach(result => {
        weatherDataMap[result.vacationId] = result.weather;
      });
      
      setAllWeatherData(weatherDataMap);
      
      // Keep the first vacation's weather for backward compatibility
      if (validResults.length > 0) {
        setWeatherData(validResults[0].weather);
      }
      
    } catch (error) {
      console.error('Error fetching weather forecasts:', error);
      setWeatherError('Failed to fetch weather data');
    } finally {
      setWeatherLoading(false);
    }
  }, [token, vacations]);

  // Memoized holiday operation functions
  const handleAddHoliday = useCallback(async (holidayData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(holidayData)
      });
      if (response.ok) {
        const newHoliday = await response.json();
        // Update local state immediately instead of refetching (low priority)
        startHolidayTransition(() => {
          setOfficialHolidays(prev => [...prev, newHoliday]);
        });
      } else {
        // If add fails, refresh to sync state
        console.error('Failed to add holiday, refreshing list...');
        fetchOfficialHolidays();
      }
    } catch (error) {
      console.error('Error adding holiday:', error);
      // On error, refresh to sync state
      fetchOfficialHolidays();
    }
  }, [token, fetchOfficialHolidays]);

  const handleDeleteHoliday = useCallback(async (holidayId) => {
    try {
      // Optimistic update - remove from UI immediately
      startHolidayTransition(() => {
        setOfficialHolidays(prev => {
          const index = prev.findIndex(holiday => holiday._id === holidayId);
          if (index === -1) return prev; // Holiday not found
          const newHolidays = [...prev];
          newHolidays.splice(index, 1);
          return newHolidays;
        });
      });
      
      // Then make the API call
      const response = await fetch(`${API_BASE_URL}/holidays/${holidayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Holiday not found in database - refresh the list to sync
          console.warn('Holiday not found in database, refreshing list...');
          fetchOfficialHolidays();
        } else {
          // Other error - revert the optimistic update
          console.error('Failed to delete holiday from server');
          fetchOfficialHolidays(); // Refresh to sync state
        }
      }
      
      return response.ok; // Return success status
    } catch (error) {
      console.error('Error deleting holiday:', error);
      // Revert optimistic update on error by refreshing
      fetchOfficialHolidays();
      throw error; // Re-throw to be caught by the calling component
    }
  }, [token, fetchOfficialHolidays]);

  // Memoized calendar navigation handlers to avoid prop churn causing re-renders

  const handleCalendarViewChange = useCallback((view) => {
    // no-op placeholder to keep stable reference if needed later
  }, []);

  // Load all data in parallel - simplified without loading states
  useEffect(() => {
    if (user && token && !initialDataFetched) {
      // Simply run the API calls without loading states
      fetchOfficialHolidays();
      fetchVacations();
      fetchLeaveBalances();
      setInitialDataFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, initialDataFetched]);

  // Fetch AI insights when vacations change (with debounce)
  useEffect(() => {
    if (vacations.length > 0 && !aiInsightsFetched) {
      const timeoutId = setTimeout(() => {
        fetchAIInsights();
        fetchWeatherForecast(); // Also fetch weather forecast
        setAiInsightsFetched(true);
      }, 2000); // 2 second debounce to prevent rapid calls
      
      return () => clearTimeout(timeoutId);
    }
  }, [vacations.length, aiInsightsFetched, fetchAIInsights, fetchWeatherForecast]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading PlanWise</h2>
          <p className="text-gray-500">Please wait while we set up your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        {showLogin === null ? (
          <Home 
            onSignIn={() => setShowLogin(true)}
            onGetStarted={() => setShowLogin(false)}
            onBackToHome={() => setShowLogin(null)}
            showBackButton={false}
          />
        ) : (
          <>
            <Header 
              onSignIn={() => setShowLogin(true)}
              onGetStarted={() => setShowLogin(false)}
              onBackToHome={() => setShowLogin(null)}
              showBackButton={true}
            />
            
            <main className="min-h-screen">
              <div className="max-w-md mx-auto py-20">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {showLogin ? 'Sign In' : 'Get Started'}
                  </h2>
                  <p className="text-gray-600">
                    {showLogin ? 'Welcome back! Please sign in to your account.' : 'Create your account to start tracking your leave.'}
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  {showLogin ? (
                    <>
                      {loginError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                          {loginError}
                        </div>
                      )}
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        setLoginError('');
                        const formData = new FormData(e.target);
                        const email = formData.get('email');
                        const password = formData.get('password');
                        
                        const result = await login(email, password);
                        if (!result.success) {
                          setLoginError(result.error);
                        }
                      }} className="space-y-6">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                          </label>
                          <div className="mt-1">
                            <input
                              id="email"
                              name="email"
                              type="email"
                              required
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Enter your email"
                              aria-describedby="email-help"
                              autoComplete="email"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <div className="mt-1">
                            <input
                              id="password"
                              name="password"
                              type="password"
                              required
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Enter your password"
                              aria-describedby="password-help"
                              autoComplete="current-password"
                            />
                          </div>
                        </div>
                        <div>
                          <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            aria-label="Sign in to your account"
                          >
                            Sign in
                          </button>
                        </div>
                      </form>
                      <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                          Don't have an account?{' '}
                          <button
                            onClick={() => setShowLogin(false)}
                            className="font-medium text-blue-600 hover:text-blue-500"
                          >
                            Create one here
                          </button>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Register />
                      <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                          Already have an account?{' '}
                          <button
                            onClick={() => setShowLogin(true)}
                            className="font-medium text-blue-600 hover:text-blue-500"
                          >
                            Sign in here
                          </button>
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowLogin(null)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Back to home
                  </button>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    );
  }

  const navigateToDate = (newDate, view, action) => {
    setCalendarDate(newDate);
  };


  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <SkipNavigation />
      <header id="navigation" className="bg-white shadow-sm border-b border-gray-200" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 md:py-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-gray-700">
                  {t('auth.welcomeBack')}, {user.name}!
                </h1>
                {/* Role Badge */}
                <div className="mt-1">
                  {user.role === 'employee' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Employee
                    </span>
                  )}
                  {user.role === 'manager' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Manager
                    </span>
                  )}
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Admin
                    </span>
                  )}
                </div>
              </div>
              
              {/* Navigation Tabs - Role-based visibility */}
              <nav className="hidden md:flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActivePage('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePage === 'dashboard'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                
                {/* Show "My Team" for managers (including admins who are also managers) */}
                {(user.role === 'manager' || user.role === 'admin') && (
                  <button
                    onClick={() => setActivePage('team')}
                    onMouseEnter={() => {
                      preloadMyTeam();
                      if (!teamDataPrefetched && token) {
                        prefetchTeamData(token);
                        setTeamDataPrefetched(true);
                      }
                    }}
                    onFocus={() => {
                      preloadMyTeam();
                      if (!teamDataPrefetched && token) {
                        prefetchTeamData(token);
                        setTeamDataPrefetched(true);
                      }
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activePage === 'team'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    My Team
                  </button>
                )}
                
                {/* Show "Admin Panel" only for admins */}
                {user.role === 'admin' && (
                  <button
                    onClick={() => setActivePage('admin')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activePage === 'admin'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Admin Panel
                  </button>
                )}
              </nav>
            </div>
            
            <div className="flex items-center space-x-3 md:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Backend Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Backend</span>
              </div>
              <LanguageToggle />
              <NotificationBell />
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 md:px-4 rounded text-sm md:text-base"
                aria-label="Sign out of your account"
                tabIndex={0}
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation - Role-based visibility */}
          <div className="md:hidden flex space-x-2 pb-4">
            <button
              onClick={() => setActivePage('dashboard')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePage === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Dashboard
            </button>
            
            {/* Show "My Team" for managers (including admins who are also managers) */}
            {(user.role === 'manager' || user.role === 'admin') && (
              <button
                onClick={() => setActivePage('team')}
                onMouseEnter={() => {
                  preloadMyTeam();
                  if (!teamDataPrefetched && token) {
                    prefetchTeamData(token);
                    setTeamDataPrefetched(true);
                  }
                }}
                onFocus={() => {
                  preloadMyTeam();
                  if (!teamDataPrefetched && token) {
                    prefetchTeamData(token);
                    setTeamDataPrefetched(true);
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === 'team'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                My Team
              </button>
            )}
            
            {/* Show "Admin" only for admins */}
            {user.role === 'admin' && (
              <button
                onClick={() => setActivePage('admin')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === 'admin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Data Loading Progress Bar - Temporarily disabled */}

      <main id="main-content" className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8" role="main">
        <div className="py-4 md:py-6">
          {/* Conditional Page Rendering */}
          {activePage === 'team' ? (
            user ? (
              <Suspense fallback={
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/3 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
                  </div>
                </div>
              }>
                <MyTeam />
              </Suspense>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                <div className="text-yellow-600 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
                <p className="text-gray-600">Please log in to access team management features.</p>
              </div>
            )
          ) : activePage === 'admin' ? (
            <Suspense fallback={
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-1/3 mx-auto"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            }>
              <AdminPanel />
            </Suspense>
          ) : (
          /* Responsive Layout - Single column on mobile, two columns on desktop */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Left Column - Calendar, Vacation Form & Holiday Management */}
            <section className="space-y-4 md:space-y-6" aria-label="Calendar and leave management">
              {/* Calendar Section */}
              <Suspense fallback={
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {[...Array(35)].map((_, i) => (
                        <div key={i} className="h-8 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              }>
                <Calendar
                  holidays={officialHolidays}
                  vacations={vacations}
                  currentDate={calendarDate}
                  onNavigate={navigateToDate}
                  onViewChange={handleCalendarViewChange}
                  isLoading={false}
                />
              </Suspense>

              {/* Leave Form Section */}
              <Suspense fallback={
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                    <div className="space-y-4">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              }>
                <LeaveForm
                  leaveBalances={leaveBalances}
                  existingVacations={vacations}
                  holidays={officialHolidays}
                  onAddVacation={async (vacationData) => {
                  try {
                    console.log('🚀 FRONTEND: Submitting vacation:', vacationData);
                    console.log('🌐 FRONTEND: API URL:', `${API_BASE_URL}/vacations`);
                    console.log('📤 FRONTEND: Request body:', JSON.stringify(vacationData));
                    
                    const response = await fetch(`${API_BASE_URL}/vacations`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(vacationData)
                    });
                    
                    console.log('📡 FRONTEND: Response status:', response.status, response.statusText);
                    
                    if (response.ok) {
                      const newVacation = await response.json();
                      console.log('Vacation added successfully:', newVacation);
                      
                      // Update leave balance based on vacation type
                      const { leaveType, days } = vacationData;
                      const newBalance = Math.max(0, leaveBalances[leaveType] - days);
                      
                      // Update leave balance in database
                      try {
                        const balanceResponse = await fetch(`${API_BASE_URL}/leave-balances/${leaveType}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ balance: newBalance })
                        });
                        
                        if (balanceResponse.ok) {
                          setLeaveBalances(prev => ({
                            ...prev,
                            [leaveType]: newBalance
                          }));
                        }
                      } catch (error) {
                        console.error(`Error updating ${leaveType} balance:`, error);
                      }
                      
                      fetchVacations();
                    } else {
                      const errorText = await response.text();
                      console.error('Failed to add vacation:', response.status, errorText);
                    }
                  } catch (error) {
                    console.error('Error adding vacation:', error);
                  }
                }}
                />
              </Suspense>

              {/* Holiday Management Section */}
              <Suspense fallback={
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              }>
                <HolidayManager
                holidays={officialHolidays}
                API_BASE_URL={API_BASE_URL}
                token={token}
                onAddHoliday={handleAddHoliday}
                onDeleteHoliday={handleDeleteHoliday}
                isLoading={false}
              />
              </Suspense>
            </section>

            {/* Right Column - Insights Dashboard */}
            <section className="space-y-4 md:space-y-6" aria-label="Dashboard insights and analytics">
              <Suspense fallback={
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-32 bg-gray-200 rounded"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              }>
                <Insights
                holidays={officialHolidays}
                vacations={vacations}
                leaveBalances={leaveBalances}
                onNavigateToDate={navigateToDate}
                isLoading={false}
                aiInsights={aiInsights}
                aiLoading={aiLoading}
                aiError={aiError}
                weatherData={weatherData}
                allWeatherData={allWeatherData}
                weatherLoading={weatherLoading}
                weatherError={weatherError}
                onDeleteVacation={async (vacationId) => {
                  try {
                    const vacationToDelete = vacations.find(v => v._id === vacationId);
                    if (!vacationToDelete) {
                      throw new Error('Vacation not found');
                    }
                    
                    const response = await fetch(`${API_BASE_URL}/vacations/${vacationId}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    
                    if (response.ok) {
                      // Restore leave balance
                      const { leaveType, days } = vacationToDelete;
                      const currentBalance = leaveBalances[leaveType] || 0;
                      const newBalance = currentBalance + days;
                      
                      try {
                        const balanceResponse = await fetch(`${API_BASE_URL}/leave-balances/${leaveType}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ balance: newBalance })
                        });
                        
                        if (balanceResponse.ok) {
                          setLeaveBalances(prev => ({
                            ...prev,
                            [leaveType]: newBalance
                          }));
                        }
                      } catch (error) {
                        console.error(`Error restoring ${leaveType} balance:`, error);
                      }
                      
                      fetchVacations();
                    } else {
                      const errorText = await response.text();
                      throw new Error(`Failed to delete vacation: ${response.status} - ${errorText}`);
                    }
                  } catch (error) {
                    console.error('Error deleting vacation:', error);
                    throw error;
                  }
                }}
                onUpdateLeaveBalances={async (newBalances) => {
                  try {
                    const updatePromises = Object.entries(newBalances).filter(([type, balance]) => {
                      return leaveBalances[type] !== balance;
                    }).map(async ([type, balance]) => {
                      const response = await fetch(`${API_BASE_URL}/leave-balances/${type}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ balance })
                      });
                      
                      if (!response.ok) {
                        throw new Error(`Failed to update ${type} balance`);
                      }
                      
                      return response.json();
                    });
                    
                    await Promise.all(updatePromises);
                    setLeaveBalances(newBalances);
                  } catch (error) {
                    console.error('Error updating leave balances:', error);
                    fetchLeaveBalances();
                  }
                }}
              />
              </Suspense>
            </section>
          </div>
          )}
        </div>
      </main>
      </div>
    </NotificationProvider>
  );
}

export default App;


