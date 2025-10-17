import React, { useMemo, useState } from 'react';
import { 
  BarChart3, TrendingUp, Calendar, Clock, 
  Users, MapPin, Award, Filter 
} from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import LoadingSkeleton from '../ui/LoadingSkeleton';

// Chart placeholder component (replace with actual chart library)
const ChartPlaceholder = React.memo(({ title, height = 200 }) => (
  <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200`} style={{ height }}>
    <div className="text-center">
      <BarChart3 className="mx-auto text-blue-400 mb-2" size={32} />
      <p className="text-sm text-blue-600 font-medium">{title}</p>
      <p className="text-xs text-blue-500 mt-1">Chart visualization</p>
    </div>
  </div>
));

ChartPlaceholder.displayName = 'ChartPlaceholder';

// Metric card component
const MetricCard = React.memo(({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  trend = 'neutral',
  color = 'blue',
  loading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="w-8 h-8 rounded" />
          <LoadingSkeleton className="w-12 h-4" />
        </div>
        <LoadingSkeleton className="w-16 h-8 mt-4" />
        <LoadingSkeleton className="w-24 h-3 mt-2" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center text-sm ${
            trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            <TrendingUp size={14} className={`mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

// Leave trends component
const LeaveTrends = React.memo(() => {
  const { leaves, statistics, loading } = useTeam();
  const [timeRange, setTimeRange] = useState('month');

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

    // Group by leave type
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

  if (loading.leaves) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <LoadingSkeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          <LoadingSkeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <LoadingSkeleton className="h-16 w-full" />
            <LoadingSkeleton className="h-16 w-full" />
            <LoadingSkeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Leave Trends</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {trendData ? (
        <div className="space-y-6">
          {/* Chart Area */}
          <ChartPlaceholder title="Leave Trends Over Time" height={250} />
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{trendData.totalLeaves}</p>
              <p className="text-sm text-blue-600">Total Requests</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{trendData.totalDays}</p>
              <p className="text-sm text-green-600">Total Days</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{trendData.averageLeave.toFixed(1)}</p>
              <p className="text-sm text-purple-600">Avg. Days</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{Object.keys(trendData.leaveTypes).length}</p>
              <p className="text-sm text-orange-600">Leave Types</p>
            </div>
          </div>

          {/* Leave Type Breakdown */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Leave Type Distribution</h4>
            <div className="space-y-2">
              {Object.entries(trendData.leaveTypes).map(([type, days]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'EL' ? 'bg-blue-500' :
                      type === 'SL' ? 'bg-green-500' :
                      type === 'CL' ? 'bg-purple-500' : 'bg-gray-500'
                    }`} />
                    <span className="font-medium text-gray-900">
                      {type === 'EL' ? 'Earned Leave' :
                       type === 'SL' ? 'Sick Leave' :
                       type === 'CL' ? 'Casual Leave' : type}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{days} days</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Leave Data</h4>
          <p className="text-gray-600">No leave requests found for the selected time period.</p>
        </div>
      )}
    </div>
  );
});

LeaveTrends.displayName = 'LeaveTrends';

// Team performance insights
const TeamInsights = React.memo(() => {
  const { statistics, teamStats, allMembers } = useTeam();

  const insights = useMemo(() => {
    if (!statistics || !allMembers) return [];

    const insights = [];

    // Utilization insight
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

    // Team size insight
    if (teamStats.totalMembers < 3) {
      insights.push({
        type: 'suggestion',
        title: 'Small Team Size',
        description: 'Consider adding more team members to reduce individual workload and improve coverage.',
        icon: Users,
        color: 'purple'
      });
    }

    // Pending approvals insight
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
  }, [statistics, teamStats, allMembers]);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Award className="mr-2" size={20} />
        Team Insights
      </h3>

      {insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                insight.color === 'red' ? 'border-red-500 bg-red-50' :
                insight.color === 'orange' ? 'border-orange-500 bg-orange-50' :
                insight.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                insight.color === 'purple' ? 'border-purple-500 bg-purple-50' :
                'border-gray-500 bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <insight.icon
                  className={`mt-0.5 ${
                    insight.color === 'red' ? 'text-red-600' :
                    insight.color === 'orange' ? 'text-orange-600' :
                    insight.color === 'blue' ? 'text-blue-600' :
                    insight.color === 'purple' ? 'text-purple-600' :
                    'text-gray-600'
                  }`}
                  size={20}
                />
                <div>
                  <h4 className={`font-medium ${
                    insight.color === 'red' ? 'text-red-900' :
                    insight.color === 'orange' ? 'text-orange-900' :
                    insight.color === 'blue' ? 'text-blue-900' :
                    insight.color === 'purple' ? 'text-purple-900' :
                    'text-gray-900'
                  }`}>
                    {insight.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    insight.color === 'red' ? 'text-red-700' :
                    insight.color === 'orange' ? 'text-orange-700' :
                    insight.color === 'blue' ? 'text-blue-700' :
                    insight.color === 'purple' ? 'text-purple-700' :
                    'text-gray-700'
                  }`}>
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Award className="mx-auto text-gray-400 mb-4" size={48} />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h4>
          <p className="text-gray-600">More data needed to generate team insights.</p>
        </div>
      )}
    </div>
  );
});

TeamInsights.displayName = 'TeamInsights';

// Main analytics component
const TeamAnalytics = React.memo(() => {
  const { statistics, teamStats, loading, errors } = useTeam();

  if (errors.leaves) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Unable to Load Analytics</h3>
          <p className="text-red-700">{errors.leaves.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Insights into your team's leave patterns and performance
          </p>
        </div>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Filter size={16} />
          <span>Export Data</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          label="Team Members"
          value={teamStats.totalMembers}
          change={12}
          trend="up"
          color="blue"
          loading={loading.team}
        />
        
        <MetricCard
          icon={Calendar}
          label="Total Leave Days"
          value={statistics?.totalLeaves || 0}
          change={-5}
          trend="down"
          color="green"
          loading={loading.leaves}
        />
        
        <MetricCard
          icon={Clock}
          label="Pending Approvals"
          value={teamStats.pendingApprovals}
          color="orange"
          loading={loading.approvals}
        />
        
        <MetricCard
          icon={TrendingUp}
          label="Approval Rate"
          value="94%"
          change={3}
          trend="up"
          color="purple"
          loading={loading.leaves}
        />
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaveTrends />
        <TeamInsights />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Leave Distribution</h3>
          <ChartPlaceholder title="Monthly Leave Calendar View" height={300} />
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Destinations</h3>
          <ChartPlaceholder title="Team Travel Destinations Map" height={300} />
        </div>
      </div>
    </div>
  );
});

TeamAnalytics.displayName = 'TeamAnalytics';

export default TeamAnalytics;
