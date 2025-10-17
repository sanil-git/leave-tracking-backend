import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import useSWR, { mutate, preload } from 'swr';
import { useDataPrefetcher } from '../hooks/useComponentPreloader';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://leave-tracking-backend.onrender.com');

// Team Context
const TeamContext = createContext();

// Team state reducer
const teamReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.key]: action.payload } };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.key]: action.payload } };
    case 'TOGGLE_MODAL':
      return { ...state, modals: { ...state.modals, [action.modal]: !state.modals[action.modal] } };
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.payload } };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, [action.key]: action.payload } };
    case 'SET_PREFETCH_STATUS':
      return { ...state, prefetchStatus: { ...state.prefetchStatus, [action.key]: action.status } };
    case 'RESET_STATE':
      return action.payload;
    default:
      return state;
  }
};

// Initial state
const initialState = {
  activeTab: 'members',
  loading: {
    team: false,
    members: false,
    analytics: false,
    approvals: false,
  },
  errors: {},
  modals: {
    addMember: false,
    createTeam: false,
    editMember: false,
  },
  filters: {
    memberStatus: 'all', // all, available, on-leave
    leaveType: 'all',    // all, EL, SL, CL
    dateRange: 'all',    // all, this-month, this-quarter
  },
  pagination: {
    members: { page: 0, pageSize: 50 },
    leaves: { page: 0, pageSize: 20 },
  },
  prefetchStatus: {
    analytics: 'idle', // idle, loading, success, error
    approvals: 'idle',
    members: 'idle'
  }
};

// SWR fetcher with authentication
const createFetcher = (token) => async (url) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = new Error('API Error');
    error.status = response.status;
    error.info = await response.json();
    throw error;
  }
  
  return response.json();
};

// Team Provider Component with Preloading
export const TeamProvider = ({ children }) => {
  const [state, dispatch] = useReducer(teamReducer, initialState);
  const { prefetchData, getPrefetchedData, isPrefetched, cleanup } = useDataPrefetcher();
  
  // Get auth data
  const authData = useMemo(() => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || '{}')
  }), []);

  const fetcher = useMemo(() => createFetcher(authData.token), [authData.token]);

  // SWR hooks for data fetching with caching
  const {
    data: teamData,
    error: teamError,
    mutate: mutateTeam,
    isLoading: teamLoading
  } = useSWR(
    authData.token ? `${API_BASE_URL}/api/teams/my-team` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      fallbackData: getPrefetchedData('team'), // Use prefetched data as fallback
      onError: (error) => {
        dispatch({ type: 'SET_ERROR', key: 'team', payload: error.message });
      }
    }
  );

  const {
    data: pendingApprovals,
    error: approvalsError,
    mutate: mutateApprovals,
    isLoading: approvalsLoading
  } = useSWR(
    authData.token ? `${API_BASE_URL}/api/leaves/pending` : null,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      fallbackData: getPrefetchedData('approvals'),
      onError: (error) => {
        dispatch({ type: 'SET_ERROR', key: 'approvals', payload: error.message });
      }
    }
  );

  const {
    data: teamLeaves,
    error: leavesError,
    mutate: mutateLeaves,
    isLoading: leavesLoading
  } = useSWR(
    authData.token && teamData?.teamId ? `${API_BASE_URL}/api/teams/${teamData.teamId}/leaves` : null,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
      fallbackData: getPrefetchedData('analytics'),
      onError: (error) => {
        dispatch({ type: 'SET_ERROR', key: 'leaves', payload: error.message });
      }
    }
  );

  const {
    data: pendingUsers,
    error: pendingUsersError,
    mutate: mutatePendingUsers,
    isLoading: pendingUsersLoading
  } = useSWR(
    authData.token ? `${API_BASE_URL}/api/users/temp-passwords` : null,
    fetcher,
    {
      refreshInterval: 30000,
      fallbackData: getPrefetchedData('pendingUsers'),
      onError: (error) => {
        dispatch({ type: 'SET_ERROR', key: 'pendingUsers', payload: error.message });
      }
    }
  );

  // Prefetch functions for different data types
  const prefetchTeamData = useCallback(async () => {
    if (!authData.token) return;
    
    const promises = [
      prefetchData('team', () => fetcher(`${API_BASE_URL}/api/teams/my-team`)),
      prefetchData('approvals', () => fetcher(`${API_BASE_URL}/api/leaves/pending`)),
      prefetchData('pendingUsers', () => fetcher(`${API_BASE_URL}/api/users/temp-passwords`))
    ];
    
    await Promise.allSettled(promises);
  }, [authData.token, fetcher, prefetchData]);

  const prefetchAnalyticsData = useCallback(async () => {
    if (!authData.token || !teamData?.teamId) return;
    
    await prefetchData('analytics', () => 
      fetcher(`${API_BASE_URL}/api/teams/${teamData.teamId}/leaves`)
    );
  }, [authData.token, teamData?.teamId, fetcher, prefetchData]);

  // Preload SWR data using SWR's preload function
  const preloadSWRData = useCallback((keys = []) => {
    if (!authData.token) return;
    
    const urlMap = {
      team: `${API_BASE_URL}/api/teams/my-team`,
      approvals: `${API_BASE_URL}/api/leaves/pending`,
      pendingUsers: `${API_BASE_URL}/api/users/temp-passwords`,
      analytics: teamData?.teamId ? `${API_BASE_URL}/api/teams/${teamData.teamId}/leaves` : null
    };
    
    keys.forEach(key => {
      const url = urlMap[key];
      if (url) {
        console.log(`🔄 SWR Preloading: ${key}`);
        preload(url, fetcher);
      }
    });
  }, [authData.token, teamData?.teamId, fetcher]);

  // Enhanced prefetch functions that combine custom prefetch and SWR preload
  const prefetchForTab = useCallback(async (tabName) => {
    dispatch({ type: 'SET_PREFETCH_STATUS', key: tabName, status: 'loading' });
    
    try {
      switch (tabName) {
        case 'members':
          await prefetchTeamData();
          preloadSWRData(['team', 'pendingUsers']);
          break;
        case 'approvals':
          await prefetchTeamData();
          preloadSWRData(['approvals', 'team']);
          break;
        case 'analytics':
          await prefetchTeamData();
          await prefetchAnalyticsData();
          preloadSWRData(['analytics', 'team']);
          break;
        default:
          break;
      }
      
      dispatch({ type: 'SET_PREFETCH_STATUS', key: tabName, status: 'success' });
    } catch (error) {
      console.error(`Failed to prefetch data for ${tabName}:`, error);
      dispatch({ type: 'SET_PREFETCH_STATUS', key: tabName, status: 'error' });
    }
  }, [prefetchTeamData, prefetchAnalyticsData, preloadSWRData]);

  // Memoized actions
  const actions = useMemo(() => ({
    // Tab management
    setActiveTab: (tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    
    // Modal management
    toggleModal: (modal) => dispatch({ type: 'TOGGLE_MODAL', modal }),
    
    // Filter management
    setFilter: (key, value) => dispatch({ type: 'SET_FILTER', key, payload: value }),
    
    // Prefetch functions
    prefetchForTab,
    prefetchTeamData,
    prefetchAnalyticsData,
    preloadSWRData,
    
    // Check if data is prefetched
    isPrefetched: (key) => isPrefetched(key),
    
    // API actions with optimistic updates
    addTeamMember: async (email) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/teams/members`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        if (!response.ok) throw new Error('Failed to add member');
        
        await mutateTeam();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    removeTeamMember: async (memberId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/teams/members/${memberId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authData.token}`
          }
        });

        if (!response.ok) throw new Error('Failed to remove member');
        
        await mutateTeam();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    approveLeave: async (leaveId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leaves/${leaveId}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authData.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to approve leave');
        
        await Promise.all([mutateApprovals(), mutateLeaves()]);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    rejectLeave: async (leaveId, reason) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leaves/${leaveId}/reject`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rejectionReason: reason })
        });

        if (!response.ok) throw new Error('Failed to reject leave');
        
        await Promise.all([mutateApprovals(), mutateLeaves()]);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    createTeam: async (name, description) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/teams`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: name.trim(), description: description?.trim() || '' })
        });

        if (!response.ok) throw new Error('Failed to create team');
        
        const data = await response.json();
        await mutateTeam(data.team, false);
        return { success: true, team: data.team };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Manual refresh functions
    refreshTeam: () => mutateTeam(),
    refreshApprovals: () => mutateApprovals(),
    refreshLeaves: () => mutateLeaves(),
    refreshPendingUsers: () => mutatePendingUsers(),
  }), [
    authData.token,
    mutateTeam,
    mutateApprovals,
    mutateLeaves,
    mutatePendingUsers,
    prefetchForTab,
    prefetchTeamData,
    prefetchAnalyticsData,
    preloadSWRData,
    isPrefetched
  ]);

  // Computed values
  const computedData = useMemo(() => {
    const members = teamData?.members || [];
    const approvals = pendingApprovals || [];
    const leaves = teamLeaves?.leaves || [];
    const statistics = teamLeaves?.statistics || {};
    const pending = pendingUsers?.users || [];

    // Filter members based on current filter
    const filteredMembers = members.filter(member => {
      if (state.filters.memberStatus === 'all') return true;
      return member.status === state.filters.memberStatus;
    });

    // Team statistics
    const teamStats = {
      totalMembers: members.length,
      availableMembers: members.filter(m => m.status !== 'on-leave').length,
      onLeaveMembers: members.filter(m => m.status === 'on-leave').length,
      pendingApprovals: approvals.length,
      pendingUsers: pending.length,
      totalLeaves: statistics.totalLeaves || 0,
    };

    return {
      members: filteredMembers,
      allMembers: members,
      approvals,
      leaves,
      statistics,
      pendingUsers: pending,
      teamStats,
      hasTeam: !!teamData,
      isManager: authData.user?.role === 'manager' || authData.user?.role === 'admin',
    };
  }, [
    teamData,
    pendingApprovals,
    teamLeaves,
    pendingUsers,
    state.filters,
    authData.user
  ]);

  // Loading states - enhanced to consider both SWR loading and prefetch status
  const loading = useMemo(() => {
    const isTabPrefetched = (tab) => state.prefetchStatus[tab] === 'success';
    
    return {
      team: teamLoading && !isTabPrefetched('members'),
      approvals: approvalsLoading && !isTabPrefetched('approvals'),
      leaves: leavesLoading && !isTabPrefetched('analytics'),
      pendingUsers: pendingUsersLoading,
      any: (teamLoading || approvalsLoading || leavesLoading || pendingUsersLoading) && 
           !Object.values(state.prefetchStatus).includes('success'),
    };
  }, [teamLoading, approvalsLoading, leavesLoading, pendingUsersLoading, state.prefetchStatus]);

  // Error states
  const errors = useMemo(() => ({
    team: teamError,
    approvals: approvalsError,
    leaves: leavesError,
    pendingUsers: pendingUsersError,
    any: teamError || approvalsError || leavesError || pendingUsersError,
  }), [teamError, approvalsError, leavesError, pendingUsersError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const contextValue = useMemo(() => ({
    // State
    state,
    dispatch,
    
    // Data
    ...computedData,
    
    // Loading and errors
    loading,
    errors,
    
    // Actions
    ...actions,
    
    // Auth
    authData,
  }), [state, computedData, loading, errors, actions, authData]);

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
};

// Hook to use team context
export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export default TeamProvider;
