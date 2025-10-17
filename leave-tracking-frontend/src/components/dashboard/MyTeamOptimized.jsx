import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { Users, Calendar, Trash2, UserPlus, CheckCircle, XCircle, BarChart3, Loader2, Clock, Key } from 'lucide-react';
import LeaveApprovalPanel from '../LeaveApprovalPanel';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://leave-tracking-backend.onrender.com');

// Optimized: Lazy load sub-components for better code splitting
const TeamAnalytics = React.lazy(() => import('./TeamAnalytics'));
const TeamMembersList = React.lazy(() => import('./TeamMembersList'));
const CreateTeamForm = React.lazy(() => import('./CreateTeamForm'));

// Optimized: useReducer for complex state management
const initialState = {
  activeTab: 'members',
  showAddMember: false,
  showCreateTeam: false,
  loading: true,
  error: null,
  teamData: null,
  teamLeaves: [],
  statistics: null,
  pendingApprovalsCount: 0,
  pendingUsers: [],
};

function teamReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TEAM_DATA':
      return { ...state, teamData: action.payload, loading: false, error: null };
    case 'SET_TEAM_LEAVES':
      return { ...state, teamLeaves: action.payload };
    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload };
    case 'SET_PENDING_COUNT':
      return { ...state, pendingApprovalsCount: action.payload };
    case 'SET_PENDING_USERS':
      return { ...state, pendingUsers: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_ADD_MEMBER':
      return { ...state, showAddMember: !state.showAddMember };
    case 'TOGGLE_CREATE_TEAM':
      return { ...state, showCreateTeam: !state.showCreateTeam };
    default:
      return state;
  }
}

// Optimized: Custom hook for API calls with caching
function useTeamAPI() {
  const [cache, setCache] = useState(new Map());
  
  // Optimized: Memoized auth data to prevent re-renders
  const authData = useMemo(() => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || '{}')
  }), []);

  // Optimized: API call with caching and abort controller
  const fetchWithCache = useCallback(async (url, options = {}) => {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Return cached data if available and fresh (5 minutes)
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.data;
      }
    }

    const controller = new AbortController();
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      // Cache successful responses
      setCache(prev => new Map(prev.set(cacheKey, {
        data,
        timestamp: Date.now()
      })));
      
      return data;
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
    }
  }, [authData.token, cache]);

  return { fetchWithCache, authData };
}

function MyTeamOptimized() {
  const [state, dispatch] = useReducer(teamReducer, initialState);
  const { fetchWithCache, authData } = useTeamAPI();

  // Optimized: Memoized API functions to prevent re-renders
  const fetchTeamData = useCallback(async () => {
    if (!authData.token) {
      dispatch({ type: 'SET_ERROR', payload: 'No authentication token found.' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const data = await fetchWithCache(`${API_BASE_URL}/api/teams/my-team`);
      dispatch({ type: 'SET_TEAM_DATA', payload: data });
    } catch (err) {
      console.error('Fetch team error:', err);
      if (err.message.includes('404')) {
        dispatch({ type: 'SET_TEAM_DATA', payload: null });
      } else if (err.message.includes('403')) {
        dispatch({ type: 'SET_ERROR', payload: 'Manager access required.' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Network error. Please try again.' });
      }
    }
  }, [authData.token, fetchWithCache]);

  const fetchPendingApprovalsCount = useCallback(async () => {
    if (!authData.token) return;

    try {
      const data = await fetchWithCache(`${API_BASE_URL}/api/leaves/pending`);
      dispatch({ type: 'SET_PENDING_COUNT', payload: data.length });
    } catch (error) {
      console.error('Error fetching pending approvals count:', error);
      dispatch({ type: 'SET_PENDING_COUNT', payload: 0 });
    }
  }, [authData.token, fetchWithCache]);

  const fetchPendingUsers = useCallback(async () => {
    if (!authData.token) return;
    
    try {
      const data = await fetchWithCache(`${API_BASE_URL}/api/users/temp-passwords`);
      dispatch({ type: 'SET_PENDING_USERS', payload: data.users || [] });
    } catch (err) {
      console.error('Fetch pending users error:', err);
    }
  }, [authData.token, fetchWithCache]);

  const fetchTeamLeaves = useCallback(async () => {
    if (!state.teamData?.teamId || !authData.token) return;

    try {
      const data = await fetchWithCache(`${API_BASE_URL}/api/teams/${state.teamData.teamId}/leaves`);
      dispatch({ type: 'SET_TEAM_LEAVES', payload: data.leaves });
      dispatch({ type: 'SET_STATISTICS', payload: data.statistics });
    } catch (err) {
      console.error('Fetch team leaves error:', err);
    }
  }, [state.teamData?.teamId, authData.token, fetchWithCache]);

  // Optimized: Initial data fetch with parallel requests
  useEffect(() => {
    if (authData.token) {
      Promise.allSettled([
        fetchTeamData(),
        fetchPendingApprovalsCount(),
        fetchPendingUsers()
      ]).then(() => {
        console.log('All team data requests completed');
      });
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Please log in to view team data.' });
    }
  }, [authData.token, fetchTeamData, fetchPendingApprovalsCount, fetchPendingUsers]);

  // Optimized: Only fetch team leaves when needed
  useEffect(() => {
    if ((state.activeTab === 'analytics' || state.activeTab === 'leaves') && state.teamData) {
      fetchTeamLeaves();
    }
  }, [state.activeTab, state.teamData, fetchTeamLeaves]);

  // Optimized: Memoized event handlers
  const handleTabChange = useCallback((tab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const handleToggleAddMember = useCallback(() => {
    dispatch({ type: 'TOGGLE_ADD_MEMBER' });
  }, []);

  const handleToggleCreateTeam = useCallback(() => {
    dispatch({ type: 'TOGGLE_CREATE_TEAM' });
  }, []);

  // Optimized: Memoized derived data
  const teamStats = useMemo(() => {
    if (!state.teamData?.members) return null;
    
    return {
      totalMembers: state.teamData.members.length,
      availableMembers: state.teamData.members.filter(m => m.status === 'available').length,
      onLeaveMembers: state.teamData.members.filter(m => m.status === 'on-leave').length,
    };
  }, [state.teamData?.members]);

  // Loading state
  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <span className="ml-3 text-lg text-gray-600">Loading team data...</span>
      </div>
    );
  }

  // Error state  
  if (state.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <XCircle className="mx-auto text-red-600 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Team</h3>
        <p className="text-gray-600">{state.error}</p>
        <button
          onClick={fetchTeamData}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No team state
  if (!state.teamData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <Users className="mx-auto text-blue-600 mb-6" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Team</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You don't have a team yet. Create one to start managing your team members and their leave requests.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleToggleCreateTeam}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors shadow-lg"
            >
              <UserPlus size={20} />
              <span>Create Your First Team</span>
            </button>
          </div>
          
          {state.showCreateTeam && (
            <React.Suspense fallback={<div>Loading form...</div>}>
              <CreateTeamForm
                onSubmit={handleToggleCreateTeam}
                onCancel={handleToggleCreateTeam}
                authData={authData}
                API_BASE_URL={API_BASE_URL}
              />
            </React.Suspense>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Team Header - Optimized with memoized stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{state.teamData.name}</h1>
            <p className="text-blue-100">
              {teamStats && `${teamStats.totalMembers} members • ${teamStats.availableMembers} available • ${teamStats.onLeaveMembers} on leave`}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-blue-100">Manager</p>
            <p className="text-lg font-semibold">{authData.user.name || 'You'}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Optimized with memoized handlers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-2 sm:gap-8 px-3 sm:px-6 overflow-x-auto" aria-label="Team tabs">
            {[
              { id: 'members', label: 'Team Members', icon: Users, count: teamStats?.totalMembers },
              { id: 'approvals', label: 'Leave Approvals', icon: CheckCircle, count: state.pendingApprovalsCount },
              { id: 'analytics', label: 'Team Analytics', icon: BarChart3, count: state.statistics?.totalLeaves }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  state.activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-200 text-gray-700 px-1.5 sm:px-2 py-0.5 rounded-full text-xs">
                      {tab.count || 0}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content - Optimized with lazy loading */}
        <div className="p-6">
          <React.Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          }>
            {state.activeTab === 'members' && (
              <TeamMembersList
                members={state.teamData.members}
                showAddMember={state.showAddMember}
                onToggleAddMember={handleToggleAddMember}
                authData={authData}
                API_BASE_URL={API_BASE_URL}
                onRefreshTeam={fetchTeamData}
              />
            )}
            
            {state.activeTab === 'approvals' && (
              <LeaveApprovalPanel onApprovalChange={fetchPendingApprovalsCount} />
            )}
            
            {state.activeTab === 'analytics' && (
              <TeamAnalytics
                leaves={state.teamLeaves}
                members={state.teamData.members}
                statistics={state.statistics}
                teamData={state.teamData}
              />
            )}
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}

export default React.memo(MyTeamOptimized);
