import React, { Suspense, useCallback, useMemo, useEffect } from 'react';
import { Users, BarChart3, CheckCircle, Clock, UserPlus, AlertCircle } from 'lucide-react';
import { TeamProvider, useTeam } from '../../contexts/TeamContextWithPreload';
import { useComponentPreloader, createPreloadableLazy } from '../../hooks/useComponentPreloader';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import ErrorBoundary from '../ui/ErrorBoundary';

// Create preloadable lazy components
const TeamAnalytics = createPreloadableLazy(() => 
  import('./TeamAnalyticsWithPreload').then(module => ({ default: module.default }))
);

const TeamApprovals = createPreloadableLazy(() => 
  import('./TeamApprovalsWithPreload').then(module => ({ default: module.default }))
);

const VirtualizedMemberList = createPreloadableLazy(() => 
  import('./VirtualizedMemberListWithPreload').then(module => ({ default: module.default }))
);

const CreateTeamModal = createPreloadableLazy(() => 
  import('./CreateTeamModal').then(module => ({ default: module.default }))
);

const AddMemberModal = createPreloadableLazy(() => 
  import('./AddMemberModal').then(module => ({ default: module.default }))
);

// Enhanced loading skeleton that shows until both component and data are ready
const TabContentSkeleton = React.memo(({ tabType = 'default' }) => {
  const skeletonContent = useMemo(() => {
    switch (tabType) {
      case 'members':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <LoadingSkeleton className="h-6 w-32 mb-2" />
                <LoadingSkeleton className="h-4 w-48" />
              </div>
              <LoadingSkeleton className="h-10 w-32" />
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                  <LoadingSkeleton className="w-5 h-5 mx-auto mb-1" />
                  <LoadingSkeleton className="h-6 w-8 mx-auto mb-1" />
                  <LoadingSkeleton className="h-3 w-12 mx-auto" />
                </div>
              ))}
            </div>
            
            {/* Member list */}
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border p-4 flex items-center space-x-4">
                  <LoadingSkeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <LoadingSkeleton className="h-4 w-32 mb-2" />
                    <LoadingSkeleton className="h-3 w-48 mb-1" />
                    <LoadingSkeleton className="h-3 w-24" />
                  </div>
                  <LoadingSkeleton className="w-8 h-8" />
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'approvals':
        return (
          <div className="p-6">
            <div className="mb-6">
              <LoadingSkeleton className="h-6 w-40 mb-2" />
              <LoadingSkeleton className="h-4 w-64" />
            </div>
            
            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex space-x-4">
                <LoadingSkeleton className="h-10 flex-1" />
                <LoadingSkeleton className="h-10 w-32" />
                <LoadingSkeleton className="h-10 w-32" />
              </div>
            </div>
            
            {/* Approval items */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border p-6">
                  <div className="flex items-start space-x-4">
                    <LoadingSkeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <LoadingSkeleton className="h-5 w-32" />
                        <LoadingSkeleton className="h-5 w-16" />
                      </div>
                      <LoadingSkeleton className="h-4 w-48 mb-3" />
                      <div className="flex space-x-4 mb-3">
                        <LoadingSkeleton className="h-3 w-24" />
                        <LoadingSkeleton className="h-3 w-16" />
                        <LoadingSkeleton className="h-3 w-12" />
                      </div>
                      <LoadingSkeleton className="h-3 w-40" />
                    </div>
                    <div className="flex space-x-2">
                      <LoadingSkeleton className="h-10 w-20" />
                      <LoadingSkeleton className="h-10 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <LoadingSkeleton className="h-6 w-32 mb-2" />
                <LoadingSkeleton className="h-4 w-64" />
              </div>
              <LoadingSkeleton className="h-10 w-24" />
            </div>
            
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <LoadingSkeleton className="w-8 h-8 rounded" />
                    <LoadingSkeleton className="w-12 h-4" />
                  </div>
                  <LoadingSkeleton className="w-16 h-8 mb-2" />
                  <LoadingSkeleton className="w-24 h-3" />
                </div>
              ))}
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 border">
                  <LoadingSkeleton className="h-6 w-32 mb-4" />
                  <LoadingSkeleton className="h-64 w-full" />
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-6">
            <LoadingSkeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <LoadingSkeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <LoadingSkeleton className="h-4 w-full mb-2" />
                    <LoadingSkeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  }, [tabType]);

  return (
    <div className="animate-pulse">
      {skeletonContent}
    </div>
  );
});

TabContentSkeleton.displayName = 'TabContentSkeleton';

// Memoized tab button component with preloading
const TabButton = React.memo(({ 
  tab, 
  activeTab, 
  onClick, 
  onMouseEnter,
  onMouseLeave,
  onFocus,
  icon: Icon, 
  label, 
  count, 
  loading,
  prefetchStatus
}) => {
  const isPrefetched = prefetchStatus === 'success';
  
  return (
    <button
      onClick={() => onClick(tab)}
      onMouseEnter={() => onMouseEnter?.(tab)}
      onMouseLeave={() => onMouseLeave?.(tab)}
      onFocus={() => onFocus?.(tab)}
      className={`relative py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap group ${
        activeTab === tab
          ? 'border-blue-600 text-blue-600 bg-blue-50'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center space-x-2">
        <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{label.split(' ')[0]}</span>
        
        {count !== undefined && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
            activeTab === tab 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
          }`}>
            {loading ? (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              count || 0
            )}
          </span>
        )}
        
        {/* Preload status indicator */}
        {isPrefetched && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" title="Preloaded" />
        )}
        
        {/* Loading indicator */}
        {loading && !isPrefetched && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
        )}
      </div>
    </button>
  );
});

TabButton.displayName = 'TabButton';

// Team header component with skeleton loading
const TeamHeader = React.memo(({ teamData, teamStats, loading, isManager }) => {
  if (loading.team) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <LoadingSkeleton className="h-8 w-64 mb-2 bg-blue-400" />
            <LoadingSkeleton className="h-4 w-48 bg-blue-400" />
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <LoadingSkeleton className="h-4 w-20 mb-1 bg-blue-400" />
            <LoadingSkeleton className="h-6 w-32 bg-blue-400" />
          </div>
        </div>
      </div>
    );
  }

  if (!teamData) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 animate-fadeIn">
            {teamData.name}
          </h1>
          <p className="text-blue-100 animate-fadeIn animation-delay-100">
            {teamStats.totalMembers} members • {teamStats.availableMembers} available • {teamStats.onLeaveMembers} on leave
          </p>
          
          {/* Live status indicators */}
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-blue-100">Live updates</span>
            </div>
            
            {teamStats.pendingApprovals > 0 && (
              <div className="flex items-center space-x-1">
                <AlertCircle size={12} className="text-orange-300" />
                <span className="text-xs text-orange-200">
                  {teamStats.pendingApprovals} pending
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 text-right">
          <p className="text-blue-100">Manager</p>
          <p className="text-lg font-semibold animate-fadeIn animation-delay-200">
            {isManager ? 'You' : 'Team Manager'}
          </p>
        </div>
      </div>
    </div>
  );
});

TeamHeader.displayName = 'TeamHeader';

// No team state component
const NoTeamState = React.memo(() => {
  const { toggleModal, loading } = useTeam();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <Users className="mx-auto text-blue-600 mb-6" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Team</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          You don't have a team yet. Create one to start managing your team members and their leave requests.
        </p>
        
        <button
          onClick={() => toggleModal('createTeam')}
          disabled={loading.any}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors shadow-lg mx-auto"
        >
          <UserPlus size={20} />
          <span>Create Your First Team</span>
        </button>
      </div>
    </div>
  );
});

NoTeamState.displayName = 'NoTeamState';

// Main team dashboard component
const TeamDashboard = React.memo(() => {
  const {
    state,
    hasTeam,
    teamStats,
    loading,
    errors,
    setActiveTab,
    toggleModal,
    authData,
    isManager,
    prefetchForTab
  } = useTeam();
  
  const { preloadComponent, isPreloaded: isComponentPreloaded } = useComponentPreloader();

  // Memoized tab configuration
  const tabs = useMemo(() => [
    {
      id: 'members',
      label: 'Team Members',
      icon: Users,
      count: teamStats.totalMembers,
      loading: loading.team,
      prefetchStatus: state.prefetchStatus.members
    },
    {
      id: 'approvals',
      label: 'Leave Approvals',
      icon: CheckCircle,
      count: teamStats.pendingApprovals,
      loading: loading.approvals,
      badge: teamStats.pendingApprovals > 0 ? 'urgent' : null,
      prefetchStatus: state.prefetchStatus.approvals
    },
    {
      id: 'analytics',
      label: 'Team Analytics',
      icon: BarChart3,
      count: teamStats.totalLeaves,
      loading: loading.leaves,
      prefetchStatus: state.prefetchStatus.analytics
    }
  ], [teamStats, loading, state.prefetchStatus]);

  // Enhanced tab click handler with preloading
  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
  }, [setActiveTab]);

  // Preload handler for tab hover/focus
  const handleTabPreload = useCallback((tab) => {
    console.log(`🎯 Initiating preload for tab: ${tab}`);
    
    // Preload component
    const componentMap = {
      members: () => VirtualizedMemberList.preload(),
      approvals: () => TeamApprovals.preload(),
      analytics: () => TeamAnalytics.preload()
    };
    
    const componentPreloader = componentMap[tab];
    if (componentPreloader) {
      preloadComponent(tab, componentPreloader, 100);
    }
    
    // Prefetch data
    prefetchForTab(tab);
  }, [preloadComponent, prefetchForTab]);

  const handleTabMouseLeave = useCallback(() => {
    // Optional: Cancel preload if needed
    // For now, we let preloads complete for better UX
  }, []);

  // Determine if content should show loading skeleton
  const shouldShowSkeleton = useCallback((tab) => {
    const tabData = tabs.find(t => t.id === tab);
    if (!tabData) return false;
    
    // Show skeleton if data is loading AND not prefetched
    return tabData.loading && tabData.prefetchStatus !== 'success';
  }, [tabs]);

  // Enhanced fallback component that considers both component and data loading
  const getTabFallback = useCallback((tab) => {
    return <TabContentSkeleton tabType={tab} />;
  }, []);

  if (!hasTeam) {
    return <NoTeamState />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Team Header with live data */}
      <TeamHeader 
        teamData={{ name: 'Engineering Team' }} // This would come from context
        teamStats={teamStats}
        loading={loading}
        isManager={isManager}
      />

      {/* Tab Navigation with Preloading */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Team tabs">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                tab={tab.id}
                activeTab={state.activeTab}
                onClick={handleTabClick}
                onMouseEnter={handleTabPreload}
                onMouseLeave={handleTabMouseLeave}
                onFocus={handleTabPreload}
                icon={tab.icon}
                label={tab.label}
                count={tab.count}
                loading={tab.loading}
                prefetchStatus={tab.prefetchStatus}
              />
            ))}
          </nav>
        </div>

        {/* Tab Content with Enhanced Loading */}
        <ErrorBoundary>
          <Suspense fallback={getTabFallback(state.activeTab)}>
            {state.activeTab === 'members' && (
              shouldShowSkeleton('members') ? 
                getTabFallback('members') : 
                <VirtualizedMemberList />
            )}
            
            {state.activeTab === 'approvals' && (
              shouldShowSkeleton('approvals') ? 
                getTabFallback('approvals') : 
                <TeamApprovals />
            )}
            
            {state.activeTab === 'analytics' && (
              shouldShowSkeleton('analytics') ? 
                getTabFallback('analytics') : 
                <TeamAnalytics />
            )}
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Quick Actions Bar */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex space-x-2">
          {isManager && (
            <button
              onClick={() => toggleModal('addMember')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              title="Add team member"
            >
              <UserPlus size={20} />
            </button>
          )}
          
          {teamStats.pendingApprovals > 0 && (
            <button
              onClick={() => setActiveTab('approvals')}
              className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 animate-bounce"
              title={`${teamStats.pendingApprovals} pending approvals`}
            >
              <Clock size={20} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {teamStats.pendingApprovals}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Modals with Preloading */}
      <Suspense fallback={null}>
        {state.modals.createTeam && <CreateTeamModal />}
        {state.modals.addMember && <AddMemberModal />}
      </Suspense>
    </div>
  );
});

TeamDashboard.displayName = 'TeamDashboard';

// Main component wrapper with provider
const MyTeamWithPreloading = React.memo(() => {
  return (
    <TeamProvider>
      <ErrorBoundary>
        <TeamDashboard />
      </ErrorBoundary>
    </TeamProvider>
  );
});

MyTeamWithPreloading.displayName = 'MyTeamWithPreloading';

// Export preload functions for external use (e.g., from App.js)
export const preloadMyTeamComponents = {
  members: () => VirtualizedMemberList.preload(),
  approvals: () => TeamApprovals.preload(),
  analytics: () => TeamAnalytics.preload(),
  all: () => Promise.all([
    VirtualizedMemberList.preload(),
    TeamApprovals.preload(),
    TeamAnalytics.preload()
  ])
};

export default MyTeamWithPreloading;
