import React, { Suspense, useCallback, useMemo } from 'react';
import { Users, BarChart3, CheckCircle, Clock, UserPlus, AlertCircle } from 'lucide-react';
import { TeamProvider, useTeam } from '../../contexts/TeamContext';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import ErrorBoundary from '../ui/ErrorBoundary';

// Lazy-loaded components for code splitting
const TeamAnalytics = React.lazy(() => import('./TeamAnalytics'));
const TeamApprovals = React.lazy(() => import('./TeamApprovals'));
const VirtualizedMemberList = React.lazy(() => import('./VirtualizedMemberList'));
const CreateTeamModal = React.lazy(() => import('./CreateTeamModal'));
const AddMemberModal = React.lazy(() => import('./AddMemberModal'));

// Memoized tab button component
const TabButton = React.memo(({ 
  tab, 
  activeTab, 
  onClick, 
  icon: Icon, 
  label, 
  count, 
  loading 
}) => (
  <button
    onClick={() => onClick(tab)}
    className={`relative py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
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
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          activeTab === tab 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-gray-200 text-gray-700'
        }`}>
          {loading ? (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            count || 0
          )}
        </span>
      )}
      
      {loading && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
      )}
    </div>
  </button>
));

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
    isManager
  } = useTeam();

  // Memoized tab configuration
  const tabs = useMemo(() => [
    {
      id: 'members',
      label: 'Team Members',
      icon: Users,
      count: teamStats.totalMembers,
      loading: loading.team
    },
    {
      id: 'approvals',
      label: 'Leave Approvals',
      icon: CheckCircle,
      count: teamStats.pendingApprovals,
      loading: loading.approvals,
      badge: teamStats.pendingApprovals > 0 ? 'urgent' : null
    },
    {
      id: 'analytics',
      label: 'Team Analytics',
      icon: BarChart3,
      count: teamStats.totalLeaves,
      loading: loading.leaves
    }
  ], [teamStats, loading]);

  // Memoized tab click handler
  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
  }, [setActiveTab]);

  // Loading fallback component
  const TabContentSkeleton = useMemo(() => (
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
  ), []);

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

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Team tabs">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                tab={tab.id}
                activeTab={state.activeTab}
                onClick={handleTabClick}
                icon={tab.icon}
                label={tab.label}
                count={tab.count}
                loading={tab.loading}
              />
            ))}
          </nav>
        </div>

        {/* Tab Content with Error Boundaries */}
        <ErrorBoundary>
          <Suspense fallback={TabContentSkeleton}>
            {state.activeTab === 'members' && (
              <VirtualizedMemberList />
            )}
            
            {state.activeTab === 'approvals' && (
              <TeamApprovals />
            )}
            
            {state.activeTab === 'analytics' && (
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

      {/* Modals */}
      <Suspense fallback={null}>
        {state.modals.createTeam && <CreateTeamModal />}
        {state.modals.addMember && <AddMemberModal />}
      </Suspense>
    </div>
  );
});

TeamDashboard.displayName = 'TeamDashboard';

// Main component wrapper with provider
const MyTeamFullyOptimized = React.memo(() => {
  return (
    <TeamProvider>
      <ErrorBoundary>
        <TeamDashboard />
      </ErrorBoundary>
    </TeamProvider>
  );
});

MyTeamFullyOptimized.displayName = 'MyTeamFullyOptimized';

export default MyTeamFullyOptimized;
