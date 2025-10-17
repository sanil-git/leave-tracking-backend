import React, { Suspense, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Users, BarChart3, CheckCircle, Clock, UserPlus, AlertCircle } from 'lucide-react';
import { TeamProvider, useTeam } from '../../contexts/TeamContextWithPreload';
import { useComponentPreloader, createPreloadableLazy } from '../../hooks/useComponentPreloader';
import EnhancedLoadingSkeleton, { 
  CardSkeleton, 
  MetricCardSkeleton, 
  ProgressiveLoader 
} from '../ui/EnhancedLoadingSkeleton';
import ErrorBoundary from '../ui/ErrorBoundary';

// Enhanced lazy loading with preload capability
const TeamAnalytics = createPreloadableLazy(() => 
  import('./TeamAnalyticsAnimated').then(module => ({ default: module.default }))
);

const TeamApprovals = createPreloadableLazy(() => 
  import('./TeamApprovalsAnimated').then(module => ({ default: module.default }))
);

const VirtualizedMemberList = createPreloadableLazy(() => 
  import('./VirtualizedMemberListAnimated').then(module => ({ default: module.default }))
);

const CreateTeamModal = createPreloadableLazy(() => 
  import('./CreateTeamModal').then(module => ({ default: module.default }))
);

const AddMemberModal = createPreloadableLazy(() => 
  import('./AddMemberModal').then(module => ({ default: module.default }))
);

// Animated tab transition component
const TabTransition = React.memo(({ 
  activeTab, 
  tabId, 
  children, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(activeTab === tabId);
  const [shouldRender, setShouldRender] = useState(activeTab === tabId);

  useEffect(() => {
    if (activeTab === tabId) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, tabId]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`${isVisible ? 'tab-enter' : 'tab-exit'} ${className}`}
      style={{ 
        animationFillMode: 'both',
        willChange: 'transform, opacity' 
      }}
    >
      {children}
    </div>
  );
});

TabTransition.displayName = 'TabTransition';

// Enhanced tab button with micro-interactions
const AnimatedTabButton = React.memo(({ 
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
  prefetchStatus,
  index = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef(null);
  
  const isActive = activeTab === tab;
  const isPrefetched = prefetchStatus === 'success';

  const handleMouseEnter = useCallback((e) => {
    setIsHovered(true);
    onMouseEnter?.(tab);
  }, [tab, onMouseEnter]);

  const handleMouseLeave = useCallback((e) => {
    setIsHovered(false);
    onMouseLeave?.(tab);
  }, [tab, onMouseLeave]);

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback(() => {
    onClick(tab);
    
    // Add gentle bounce feedback
    if (buttonRef.current) {
      buttonRef.current.classList.add('gentle-bounce');
      setTimeout(() => {
        buttonRef.current?.classList.remove('gentle-bounce');
      }, 600);
    }
  }, [tab, onClick]);

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={() => onFocus?.(tab)}
      className={`
        relative py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm 
        transition-all duration-300 whitespace-nowrap group gpu-accelerated
        ${isActive
          ? 'border-blue-600 text-blue-600 bg-blue-50'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
        ${isHovered ? 'hover-lift' : ''}
        ${isPressed ? 'button-press' : ''}
        animate-fadeInUp animate-delay-${index * 100}
      `}
      aria-current={isActive ? 'page' : undefined}
      style={{
        animationDelay: `${index * 100}ms`,
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      <div className="flex items-center space-x-2">
        <Icon 
          size={16} 
          className={`
            sm:w-[18px] sm:h-[18px] transition-transform duration-200
            ${isHovered ? 'scale-110' : 'scale-100'}
          `}
        />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{label.split(' ')[0]}</span>
        
        {count !== undefined && (
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200
            ${isActive 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
            }
            ${isHovered ? 'scale-105' : 'scale-100'}
          `}>
            {loading ? (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="animate-fadeInScale">{count || 0}</span>
            )}
          </span>
        )}
      </div>

      {/* Animated preload indicators */}
      <div className="absolute -top-1 -right-1 flex space-x-1">
        {isPrefetched && (
          <div 
            className="w-2 h-2 bg-green-500 rounded-full animate-fadeInScale animate-delay-300" 
            title="Preloaded"
          />
        )}
        
        {loading && !isPrefetched && (
          <div 
            className="w-2 h-2 bg-blue-500 rounded-full animate-spin" 
            title="Loading..."
          />
        )}
      </div>

      {/* Hover tooltip with animation */}
      {isHovered && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-50 animate-fadeInUp animate-delay-200">
          {isPrefetched ? '⚡ Ready for instant loading' : `${label} - Click to switch`}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
        </div>
      )}

      {/* Active tab indicator line */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-fadeInUp" />
      )}
    </button>
  );
});

AnimatedTabButton.displayName = 'AnimatedTabButton';

// Animated team header with progressive loading
const AnimatedTeamHeader = React.memo(({ teamData, teamStats, loading, isManager }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!loading.team && teamData) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading.team, teamData]);

  if (loading.team) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <EnhancedLoadingSkeleton 
              height="2rem" 
              width="16rem" 
              className="bg-blue-400"
              variant="shimmer"
            />
            <EnhancedLoadingSkeleton 
              height="1rem" 
              width="12rem" 
              className="bg-blue-400"
              variant="shimmer"
              delay={100}
            />
            <div className="flex items-center space-x-4 mt-2">
              <EnhancedLoadingSkeleton 
                height="0.75rem" 
                width="6rem" 
                className="bg-blue-400"
                variant="pulse"
                delay={200}
              />
              <EnhancedLoadingSkeleton 
                height="0.75rem" 
                width="4rem" 
                className="bg-blue-400"
                variant="pulse"
                delay={300}
              />
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right space-y-2">
            <EnhancedLoadingSkeleton 
              height="1rem" 
              width="5rem" 
              className="bg-blue-400 ml-auto"
              variant="shimmer"
              delay={150}
            />
            <EnhancedLoadingSkeleton 
              height="1.5rem" 
              width="8rem" 
              className="bg-blue-400 ml-auto"
              variant="shimmer"
              delay={250}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!teamData) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16 animate-fadeInScale animate-delay-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full transform -translate-x-12 translate-y-12 animate-fadeInScale animate-delay-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="animate-fadeInLeft">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 animate-fadeInUp">
            {teamData.name}
          </h1>
          <p className="text-blue-100 animate-fadeInUp animate-delay-100">
            {teamStats.totalMembers} members • {teamStats.availableMembers} available • {teamStats.onLeaveMembers} on leave
          </p>
          
          {/* Animated status indicators */}
          <div className="flex items-center space-x-4 mt-2 stagger-fast">
            <div className="flex items-center space-x-1 animate-fadeInUp animate-delay-200">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-blue-100">Live updates</span>
            </div>
            
            {teamStats.pendingApprovals > 0 && (
              <div className="flex items-center space-x-1 animate-fadeInUp animate-delay-300 hover-scale">
                <AlertCircle size={12} className="text-orange-300" />
                <span className="text-xs text-orange-200">
                  {teamStats.pendingApprovals} pending
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 text-right animate-fadeInRight animate-delay-200">
          <p className="text-blue-100">Manager</p>
          <p className="text-lg font-semibold animate-fadeInUp animate-delay-300">
            {isManager ? 'You' : 'Team Manager'}
          </p>
        </div>
      </div>
    </div>
  );
});

AnimatedTeamHeader.displayName = 'AnimatedTeamHeader';

// No team state with enhanced animations
const AnimatedNoTeamState = React.memo(() => {
  const { toggleModal, loading } = useTeam();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center ${isVisible ? 'animate-progressiveReveal' : 'opacity-0'}`}>
        <Users className="mx-auto text-blue-600 mb-6 animate-fadeInScale animate-delay-200" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 mb-4 animate-fadeInUp animate-delay-300">
          Create Your Team
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto animate-fadeInUp animate-delay-400">
          You don't have a team yet. Create one to start managing your team members and their leave requests.
        </p>
        
        <button
          onClick={() => toggleModal('createTeam')}
          disabled={loading.any}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg mx-auto hover-lift button-press animate-fadeInScale animate-delay-500"
        >
          <UserPlus size={20} />
          <span>Create Your First Team</span>
          {loading.any && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
          )}
        </button>
      </div>
    </div>
  );
});

AnimatedNoTeamState.displayName = 'AnimatedNoTeamState';

// Main team dashboard with comprehensive animations
const AnimatedTeamDashboard = React.memo(() => {
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
  
  const { preloadComponent } = useComponentPreloader();
  const [previousTab, setPreviousTab] = useState(state.activeTab);

  // Memoized tab configuration with animation delays
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

  // Enhanced tab click handler with animation
  const handleTabClick = useCallback((tab) => {
    if (tab !== state.activeTab) {
      setPreviousTab(state.activeTab);
      setActiveTab(tab);
    }
  }, [state.activeTab, setActiveTab]);

  // Preload handler with visual feedback
  const handleTabPreload = useCallback((tab) => {
    console.log(`🎯 Preloading tab: ${tab}`);
    
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

  // Loading state checker
  const shouldShowSkeleton = useCallback((tab) => {
    const tabData = tabs.find(t => t.id === tab);
    if (!tabData) return false;
    return tabData.loading && tabData.prefetchStatus !== 'success';
  }, [tabs]);

  // Enhanced fallback with specific skeletons
  const getTabFallback = useCallback((tab) => {
    switch (tab) {
      case 'members':
        return (
          <div className="p-6 stagger-children">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <MetricCardSkeleton key={i} delay={i * 100} />
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <CardSkeleton key={i} delay={400 + (i * 100)} contentLines={2} />
              ))}
            </div>
          </div>
        );
      case 'approvals':
        return (
          <div className="p-6 stagger-children">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} delay={i * 150} contentLines={3} hasFooter />
            ))}
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6 stagger-children">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <MetricCardSkeleton key={i} delay={i * 100} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <CardSkeleton key={i} delay={400 + (i * 150)} contentLines={4} />
              ))}
            </div>
          </div>
        );
      default:
        return <CardSkeleton />;
    }
  }, []);

  if (!hasTeam) {
    return <AnimatedNoTeamState />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Animated Team Header */}
      <AnimatedTeamHeader 
        teamData={{ name: 'Engineering Team' }}
        teamStats={teamStats}
        loading={loading}
        isManager={isManager}
      />

      {/* Enhanced Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeInUp animate-delay-200">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Team tabs">
            {tabs.map((tab, index) => (
              <AnimatedTabButton
                key={tab.id}
                tab={tab.id}
                activeTab={state.activeTab}
                onClick={handleTabClick}
                onMouseEnter={handleTabPreload}
                onFocus={handleTabPreload}
                icon={tab.icon}
                label={tab.label}
                count={tab.count}
                loading={tab.loading}
                prefetchStatus={tab.prefetchStatus}
                index={index}
              />
            ))}
          </nav>
        </div>

        {/* Animated Tab Content */}
        <ErrorBoundary>
          <TabTransition activeTab={state.activeTab} tabId="members">
            <ProgressiveLoader
              isLoading={shouldShowSkeleton('members')}
              skeleton={getTabFallback('members')}
              fadeTransition
            >
              <Suspense fallback={getTabFallback('members')}>
                <VirtualizedMemberList />
              </Suspense>
            </ProgressiveLoader>
          </TabTransition>
          
          <TabTransition activeTab={state.activeTab} tabId="approvals">
            <ProgressiveLoader
              isLoading={shouldShowSkeleton('approvals')}
              skeleton={getTabFallback('approvals')}
              fadeTransition
            >
              <Suspense fallback={getTabFallback('approvals')}>
                <TeamApprovals />
              </Suspense>
            </ProgressiveLoader>
          </TabTransition>
          
          <TabTransition activeTab={state.activeTab} tabId="analytics">
            <ProgressiveLoader
              isLoading={shouldShowSkeleton('analytics')}
              skeleton={getTabFallback('analytics')}
              fadeTransition
            >
              <Suspense fallback={getTabFallback('analytics')}>
                <TeamAnalytics />
              </Suspense>
            </ProgressiveLoader>
          </TabTransition>
        </ErrorBoundary>
      </div>

      {/* Animated Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2">
        {isManager && (
          <button
            onClick={() => toggleModal('addMember')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover-lift button-press animate-fadeInScale animate-delay-300"
            title="Add team member"
          >
            <UserPlus size={20} />
          </button>
        )}
        
        {teamStats.pendingApprovals > 0 && (
          <button
            onClick={() => setActiveTab('approvals')}
            className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover-lift button-press gentle-bounce animate-fadeInScale animate-delay-400"
            title={`${teamStats.pendingApprovals} pending approvals`}
          >
            <Clock size={20} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-fadeInScale animate-delay-500">
              {teamStats.pendingApprovals}
            </span>
          </button>
        )}
      </div>

      {/* Animated Modals */}
      <Suspense fallback={null}>
        {state.modals.createTeam && <CreateTeamModal />}
        {state.modals.addMember && <AddMemberModal />}
      </Suspense>
    </div>
  );
});

AnimatedTeamDashboard.displayName = 'AnimatedTeamDashboard';

// Main component wrapper
const MyTeamAnimated = React.memo(() => {
  return (
    <TeamProvider>
      <ErrorBoundary>
        <div className="animate-fadeInUp">
          <AnimatedTeamDashboard />
        </div>
      </ErrorBoundary>
    </TeamProvider>
  );
});

MyTeamAnimated.displayName = 'MyTeamAnimated';

// Export preload functions
export const preloadMyTeamAnimatedComponents = {
  members: () => VirtualizedMemberList.preload(),
  approvals: () => TeamApprovals.preload(),
  analytics: () => TeamAnalytics.preload(),
  all: () => Promise.all([
    VirtualizedMemberList.preload(),
    TeamApprovals.preload(),
    TeamAnalytics.preload()
  ])
};

export default MyTeamAnimated;
