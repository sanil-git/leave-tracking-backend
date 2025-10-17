import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Calendar, Clock, 
  Users, MapPin, Award, Filter, Info 
} from 'lucide-react';
import { useTeam } from '../../contexts/TeamContextWithPreload';
import EnhancedLoadingSkeleton, { 
  MetricCardSkeleton, 
  ChartSkeleton, 
  CardSkeleton,
  ProgressiveLoader 
} from '../ui/EnhancedLoadingSkeleton';
import ErrorBoundary from '../ui/ErrorBoundary';

// Animated chart placeholder with enhanced loading states
const AnimatedChartPlaceholder = React.memo(({ 
  title, 
  height = 200, 
  isLoading = false, 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center 
        border-2 border-dashed border-blue-200 transition-all duration-300 hover-lift
        ${isLoading ? 'skeleton-shimmer' : ''}
        ${isVisible ? 'animate-fadeInScale' : 'opacity-0'}
      `} 
      style={{ height }}
    >
      <div className="text-center">
        {isLoading ? (
          <div className="space-y-2">
            <EnhancedLoadingSkeleton 
              width="2rem" 
              height="2rem" 
              borderRadius="0.5rem"
              variant="pulse" 
            />
            <EnhancedLoadingSkeleton 
              height="1rem" 
              width="6rem" 
              variant="shimmer"
              delay={100}
            />
            <EnhancedLoadingSkeleton 
              height="0.75rem" 
              width="4rem" 
              variant="shimmer"
              delay={200}
            />
          </div>
        ) : (
          <>
            <BarChart3 className="mx-auto text-blue-400 mb-2 animate-fadeInScale" size={32} />
            <p className="text-sm text-blue-600 font-medium animate-fadeInUp animate-delay-100">
              {title}
            </p>
            <p className="text-xs text-blue-500 mt-1 animate-fadeInUp animate-delay-200">
              Chart visualization
            </p>
          </>
        )}
      </div>
    </div>
  );
});

AnimatedChartPlaceholder.displayName = 'AnimatedChartPlaceholder';

// Enhanced metric card with sophisticated animations and micro-interactions
const AnimatedMetricCard = React.memo(({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  trend = 'neutral',
  color = 'blue',
  loading = false,
  animationDelay = 0,
  onClick
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasAnimated(true);
    }, animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  if (!isVisible) {
    return <MetricCardSkeleton delay={animationDelay} />;
  }

  return (
    <div 
      className={`
        bg-white rounded-lg p-6 border border-gray-200 transition-all duration-300 cursor-pointer gpu-accelerated
        ${isHovered ? 'hover-lift shadow-lg border-gray-300' : 'hover:border-gray-300'}
        ${hasAnimated ? 'animate-progressiveReveal' : ''}
        ${onClick ? 'hover:shadow-md' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className={`
          p-2 rounded-lg transition-all duration-200
          ${colorClasses[color]}
          ${isHovered ? 'hover-scale' : ''}
        `}>
          <Icon size={20} />
        </div>
        
        {change !== undefined && (
          <div className={`
            flex items-center text-sm transition-all duration-200
            ${trend === 'up' ? 'text-green-600' :
              trend === 'down' ? 'text-red-600' : 'text-gray-600'}
            ${isHovered ? 'scale-105' : ''}
          `}>
            <TrendingUp 
              size={14} 
              className={`
                mr-1 transition-transform duration-200 
                ${trend === 'down' ? 'rotate-180' : ''}
                ${isHovered ? 'animate-pulse' : ''}
              `} 
            />
            <span className="animate-fadeInRight animate-delay-100">
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className={`
          text-2xl font-bold text-gray-900 transition-all duration-300
          ${isHovered ? 'text-3xl' : ''}
        `}>
          <span className="animate-fadeInUp animate-delay-200">
            {value}
          </span>
        </p>
        <p className="text-sm text-gray-600 mt-1 animate-fadeInUp animate-delay-300">
          {label}
        </p>
      </div>

      {/* Hover glow effect */}
      {isHovered && (
        <div className="absolute inset-0 rounded-lg bg-blue-500 opacity-5 animate-fadeIn" />
      )}
    </div>
  );
});

AnimatedMetricCard.displayName = 'AnimatedMetricCard';

// Enhanced leave trends component with progressive animations
const AnimatedLeaveTrends = React.memo(() => {
  const { leaves, statistics, loading, state } = useTeam();
  const [timeRange, setTimeRange] = useState('month');
  const [isDataReady, setIsDataReady] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const dataReady = !loading.leaves || state.prefetchStatus.analytics === 'success';
    setIsDataReady(dataReady);
    
    if (dataReady) {
      const timer = setTimeout(() => setShowChart(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading.leaves, state.prefetchStatus.analytics]);

  const trendData = useMemo(() => {
    if (!leaves || leaves.length === 0) return null;

    const now = new Date();
    const filteredLeaves = leaves.filter(leave => {
      const leaveDate = new Date(leave.fromDate);
      switch (timeRange) {
        case 'week':
          return leaveDate >= new Date(now - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return leaveDate >= new Date(now - 30 * 24 * 60 * 60 * 1000);
        case 'quarter':
          return leaveDate >= new Date(now - 90 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });

    const leaveTypes = filteredLeaves.reduce((acc, leave) => {
      acc[leave.leaveType] = (acc[leave.leaveType] || 0) + leave.days;
      return acc;
    }, {});

    return {
      totalLeaves: filteredLeaves.length,
      totalDays: filteredLeaves.reduce((sum, leave) => sum + leave.days, 0),
      leaveTypes,
      averageLeave: filteredLeaves.length > 0 ? 
        filteredLeaves.reduce((sum, leave) => sum + leave.days, 0) / filteredLeaves.length : 0
    };
  }, [leaves, timeRange]);

  return (
    <ProgressiveLoader
      isLoading={!isDataReady}
      skeleton={<ChartSkeleton height="400px" />}
      fadeTransition
    >
      <div className="bg-white rounded-lg p-6 border border-gray-200 animate-slideUp hover-lift transition-all duration-300">
        <div className="flex items-center justify-between mb-6 animate-fadeInUp">
          <h3 className="text-lg font-semibold text-gray-900">Leave Trends</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 hover-glow"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {trendData ? (
          <div className="space-y-6">
            {/* Chart Area with enhanced loading */}
            {showChart ? (
              <AnimatedChartPlaceholder 
                title="Leave Trends Over Time" 
                height={250} 
                isLoading={false}
                delay={200}
              />
            ) : (
              <ChartSkeleton height="250px" />
            )}
            
            {/* Summary Stats with staggered animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-fast">
              <div className="text-center p-4 bg-blue-50 rounded-lg hover-lift transition-all duration-200 animate-fadeInUp animate-delay-100">
                <p className="text-2xl font-bold text-blue-600 animate-fadeInScale animate-delay-200">
                  {trendData.totalLeaves}
                </p>
                <p className="text-sm text-blue-600">Total Requests</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg hover-lift transition-all duration-200 animate-fadeInUp animate-delay-200">
                <p className="text-2xl font-bold text-green-600 animate-fadeInScale animate-delay-300">
                  {trendData.totalDays}
                </p>
                <p className="text-sm text-green-600">Total Days</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg hover-lift transition-all duration-200 animate-fadeInUp animate-delay-300">
                <p className="text-2xl font-bold text-purple-600 animate-fadeInScale animate-delay-400">
                  {trendData.averageLeave.toFixed(1)}
                </p>
                <p className="text-sm text-purple-600">Avg. Days</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg hover-lift transition-all duration-200 animate-fadeInUp animate-delay-400">
                <p className="text-2xl font-bold text-orange-600 animate-fadeInScale animate-delay-500">
                  {Object.keys(trendData.leaveTypes).length}
                </p>
                <p className="text-sm text-orange-600">Leave Types</p>
              </div>
            </div>

            {/* Leave Type Breakdown with enhanced animations */}
            <div className="animate-fadeInUp animate-delay-300">
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="mr-2 text-gray-500" size={20} />
                Leave Type Distribution
              </h4>
              <div className="space-y-2 stagger-children">
                {Object.entries(trendData.leaveTypes).map(([type, days], index) => (
                  <div 
                    key={type} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover-lift animate-fadeInLeft"
                    style={{ animationDelay: `${(index + 5) * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-3 h-3 rounded-full transition-transform duration-200 hover:scale-150
                        ${type === 'EL' ? 'bg-blue-500' :
                          type === 'SL' ? 'bg-green-500' :
                          type === 'CL' ? 'bg-purple-500' : 'bg-gray-500'}
                      `} />
                      <span className="font-medium text-gray-900">
                        {type === 'EL' ? 'Earned Leave' :
                         type === 'SL' ? 'Sick Leave' :
                         type === 'CL' ? 'Casual Leave' : type}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 animate-fadeInRight animate-delay-100">
                      {days} days
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 animate-progressiveReveal">
            <Calendar className="mx-auto text-gray-400 mb-4 animate-fadeInScale animate-delay-200" size={48} />
            <h4 className="text-lg font-medium text-gray-900 mb-2 animate-fadeInUp animate-delay-300">
              No Leave Data
            </h4>
            <p className="text-gray-600 animate-fadeInUp animate-delay-400">
              No leave requests found for the selected time period.
            </p>
          </div>
        )}
      </div>
    </ProgressiveLoader>
  );
});

AnimatedLeaveTrends.displayName = 'AnimatedLeaveTrends';

// Team insights with enhanced animations and interactions
const AnimatedTeamInsights = React.memo(() => {
  const { statistics, teamStats, allMembers, state } = useTeam();
  const [isDataReady, setIsDataReady] = useState(false);
  const [visibleInsights, setVisibleInsights] = useState([]);

  useEffect(() => {
    const dataReady = state.prefetchStatus.analytics === 'success' || (statistics && teamStats && allMembers);
    setIsDataReady(dataReady);
  }, [statistics, teamStats, allMembers, state.prefetchStatus.analytics]);

  const insights = useMemo(() => {
    if (!statistics || !allMembers || !isDataReady) return [];

    const insights = [];
    const avgUtilization = (statistics.totalLeaves / (allMembers.length * 12)) * 100;

    if (avgUtilization > 80) {
      insights.push({
        type: 'warning',
        title: 'High Leave Utilization',
        description: `Team is using ${avgUtilization.toFixed(1)}% of available leave. Consider workload distribution.`,
        icon: TrendingUp,
        color: 'orange'
      });
    } else if (avgUtilization < 30) {
      insights.push({
        type: 'info',
        title: 'Low Leave Utilization',
        description: `Team is using only ${avgUtilization.toFixed(1)}% of available leave. Encourage work-life balance.`,
        icon: Clock,
        color: 'blue'
      });
    }

    if (teamStats.totalMembers < 3) {
      insights.push({
        type: 'suggestion',
        title: 'Small Team Size',
        description: 'Consider adding more team members to reduce individual workload and improve coverage.',
        icon: Users,
        color: 'purple'
      });
    }

    if (teamStats.pendingApprovals > 5) {
      insights.push({
        type: 'urgent',
        title: 'Many Pending Approvals',
        description: `${teamStats.pendingApprovals} leave requests need attention. Review to avoid delays.`,
        icon: Clock,
        color: 'red'
      });
    }

    return insights;
  }, [statistics, teamStats, allMembers, isDataReady]);

  // Progressive insight revelation
  useEffect(() => {
    if (insights.length > 0) {
      insights.forEach((_, index) => {
        setTimeout(() => {
          setVisibleInsights(prev => [...prev, index]);
        }, index * 200);
      });
    }
  }, [insights]);

  return (
    <ProgressiveLoader
      isLoading={!isDataReady}
      skeleton={<CardSkeleton contentLines={4} />}
      fadeTransition
    >
      <div className="bg-white rounded-lg p-6 border border-gray-200 animate-slideUp hover-lift transition-all duration-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center animate-fadeInUp">
          <Award className="mr-2" size={20} />
          Team Insights
        </h3>

        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`
                  p-4 rounded-lg border-l-4 transition-all duration-300 hover:shadow-sm cursor-pointer
                  ${insight.color === 'red' ? 'border-red-500 bg-red-50 hover:bg-red-100' :
                    insight.color === 'orange' ? 'border-orange-500 bg-orange-50 hover:bg-orange-100' :
                    insight.color === 'blue' ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' :
                    insight.color === 'purple' ? 'border-purple-500 bg-purple-50 hover:bg-purple-100' :
                    'border-gray-500 bg-gray-50 hover:bg-gray-100'}
                  ${visibleInsights.includes(index) ? 'animate-slideInFromLeft hover-lift' : 'opacity-0 translate-x-8'}
                `}
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <div className="flex items-start space-x-3">
                  <insight.icon
                    className={`
                      mt-0.5 transition-all duration-200
                      ${insight.color === 'red' ? 'text-red-600' :
                        insight.color === 'orange' ? 'text-orange-600' :
                        insight.color === 'blue' ? 'text-blue-600' :
                        insight.color === 'purple' ? 'text-purple-600' :
                        'text-gray-600'}
                      hover:scale-110
                    `}
                    size={20}
                  />
                  <div className="flex-1">
                    <h4 className={`
                      font-medium transition-colors duration-200
                      ${insight.color === 'red' ? 'text-red-900' :
                        insight.color === 'orange' ? 'text-orange-900' :
                        insight.color === 'blue' ? 'text-blue-900' :
                        insight.color === 'purple' ? 'text-purple-900' :
                        'text-gray-900'}
                    `}>
                      {insight.title}
                    </h4>
                    <p className={`
                      text-sm mt-1 transition-colors duration-200
                      ${insight.color === 'red' ? 'text-red-700' :
                        insight.color === 'orange' ? 'text-orange-700' :
                        insight.color === 'blue' ? 'text-blue-700' :
                        insight.color === 'purple' ? 'text-purple-700' :
                        'text-gray-700'}
                    `}>
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 animate-progressiveReveal">
            <Award className="mx-auto text-gray-400 mb-4 animate-fadeInScale animate-delay-200" size={48} />
            <h4 className="text-lg font-medium text-gray-900 mb-2 animate-fadeInUp animate-delay-300">
              No Insights Available
            </h4>
            <p className="text-gray-600 animate-fadeInUp animate-delay-400">
              More data needed to generate team insights.
            </p>
          </div>
        )}
      </div>
    </ProgressiveLoader>
  );
});

AnimatedTeamInsights.displayName = 'AnimatedTeamInsights';

// Main analytics component with comprehensive animations
const TeamAnalyticsAnimated = React.memo(() => {
  const { statistics, teamStats, loading, errors, state } = useTeam();
  const [isDataReady, setIsDataReady] = useState(false);
  const [showExportButton, setShowExportButton] = useState(false);

  useEffect(() => {
    const dataReady = !loading.leaves || state.prefetchStatus.analytics === 'success';
    setIsDataReady(dataReady);
    
    if (dataReady) {
      const timer = setTimeout(() => setShowExportButton(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading.leaves, state.prefetchStatus.analytics]);

  if (errors.leaves) {
    return (
      <div className="p-6 text-center animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 wiggle">
          <h3 className="text-lg font-medium text-red-900 mb-2">Unable to Load Analytics</h3>
          <p className="text-red-700">{errors.leaves.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      {/* Animated Header */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 animate-fadeInLeft">
            Team Analytics
          </h2>
          <p className="text-sm text-gray-600 mt-1 animate-fadeInLeft animate-delay-100">
            Insights into your team's leave patterns and performance
          </p>
        </div>
        
        {showExportButton && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover-lift button-press animate-fadeInRight animate-delay-200">
            <Filter size={16} />
            <span>Export Data</span>
          </button>
        )}
      </div>

      {/* Key Metrics with staggered loading and enhanced interactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-fast">
        <AnimatedMetricCard
          icon={Users}
          label="Team Members"
          value={teamStats.totalMembers}
          change={12}
          trend="up"
          color="blue"
          loading={!isDataReady}
          animationDelay={100}
        />
        
        <AnimatedMetricCard
          icon={Calendar}
          label="Total Leave Days"
          value={statistics?.totalLeaves || 0}
          change={-5}
          trend="down"
          color="green"
          loading={!isDataReady}
          animationDelay={200}
        />
        
        <AnimatedMetricCard
          icon={Clock}
          label="Pending Approvals"
          value={teamStats.pendingApprovals}
          color="orange"
          loading={!isDataReady}
          animationDelay={300}
        />
        
        <AnimatedMetricCard
          icon={TrendingUp}
          label="Approval Rate"
          value="94%"
          change={3}
          trend="up"
          color="purple"
          loading={!isDataReady}
          animationDelay={400}
        />
      </div>

      {/* Charts and Insights with enhanced loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
        <AnimatedLeaveTrends />
        <AnimatedTeamInsights />
      </div>

      {/* Additional Charts with progressive loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressiveLoader
          isLoading={!isDataReady}
          skeleton={<ChartSkeleton height="300px" />}
          fadeTransition
        >
          <div className="bg-white rounded-lg p-6 border border-gray-200 animate-slideUp animate-delay-200 hover-lift transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 animate-fadeInUp">
              Monthly Leave Distribution
            </h3>
            <AnimatedChartPlaceholder 
              title="Monthly Leave Calendar View" 
              height={300} 
              isLoading={!isDataReady}
              delay={300}
            />
          </div>
        </ProgressiveLoader>
        
        <ProgressiveLoader
          isLoading={!isDataReady}
          skeleton={<ChartSkeleton height="300px" />}
          fadeTransition
        >
          <div className="bg-white rounded-lg p-6 border border-gray-200 animate-slideUp animate-delay-300 hover-lift transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 animate-fadeInUp">
              Popular Destinations
            </h3>
            <AnimatedChartPlaceholder 
              title="Team Travel Destinations Map" 
              height={300} 
              isLoading={!isDataReady}
              delay={400}
            />
          </div>
        </ProgressiveLoader>
      </div>

      {/* Data status indicator with celebration animation */}
      {state.prefetchStatus.analytics === 'success' && (
        <div className="fixed bottom-20 right-6 bg-green-500 text-white px-3 py-1 rounded-full text-xs animate-fadeInScale gentle-bounce">
          ⚡ Analytics Ready
        </div>
      )}
    </div>
  );
});

TeamAnalyticsAnimated.displayName = 'TeamAnalyticsAnimated';

export default TeamAnalyticsAnimated;
