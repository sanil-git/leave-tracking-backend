import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Calendar, MapPin, 
  User, MessageSquare, Filter, Search, ArrowUpDown
} from 'lucide-react';
import { useTeam } from '../../contexts/TeamContextWithPreload';
import LoadingSkeleton from '../ui/LoadingSkeleton';

// Individual approval item component with enhanced loading and animations
const ApprovalItem = React.memo(({ approval, onApprove, onReject, isProcessing, animationDelay = 0 }) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Staggered animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const handleApprove = useCallback(async () => {
    if (isProcessing) return;
    const result = await onApprove(approval._id);
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
  }, [approval._id, onApprove, isProcessing]);

  const handleReject = useCallback(async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    const result = await onReject(approval._id, rejectionReason.trim());
    if (result.success) {
      setShowRejectionModal(false);
      setRejectionReason('');
    } else {
      alert(`Error: ${result.error}`);
    }
  }, [approval._id, rejectionReason, onReject]);

  // Calculate leave duration
  const leaveDuration = useMemo(() => {
    const start = new Date(approval.fromDate);
    const end = new Date(approval.toDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [approval.fromDate, approval.toDate]);

  // Format dates
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Get urgency level
  const urgencyLevel = useMemo(() => {
    const submittedDate = new Date(approval.submittedAt);
    const daysSinceSubmission = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceSubmission > 7) return 'high';
    if (daysSinceSubmission > 3) return 'medium';
    return 'low';
  }, [approval.submittedAt]);

  const urgencyColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  };

  // Loading skeleton
  if (!isVisible) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
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
    );
  }

  return (
    <div className={`bg-white rounded-lg border transition-all duration-300 hover:shadow-md animate-fadeIn ${
      urgencyLevel === 'high' ? 'border-red-200 shadow-red-50 priority-high' :
      urgencyLevel === 'medium' ? 'border-orange-200 shadow-orange-50 priority-medium' :
      'border-gray-200 priority-low'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
              {approval.user?.name?.charAt(0) || approval.user?.email?.charAt(0) || 'U'}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {approval.user?.name || 'Unknown User'}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${urgencyColors[urgencyLevel]}`}>
                  {urgencyLevel === 'high' ? 'Urgent' :
                   urgencyLevel === 'medium' ? 'Medium' : 'Normal'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {approval.user?.email}
              </p>

              {/* Leave Details */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  <span>{formatDate(approval.fromDate)} - {formatDate(approval.toDate)}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>{leaveDuration} days</span>
                </div>
                
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    approval.leaveType === 'EL' ? 'bg-blue-100 text-blue-700' :
                    approval.leaveType === 'SL' ? 'bg-green-100 text-green-700' :
                    approval.leaveType === 'CL' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {approval.leaveType}
                  </span>
                </div>
              </div>

              {/* Destination */}
              {approval.destination && (
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin size={14} className="mr-1" />
                  <span>{approval.destination}</span>
                </div>
              )}

              {/* Description */}
              {approval.description && (
                <div className="mb-3">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <MessageSquare size={14} className="mr-1" />
                    <span>View description</span>
                  </button>
                  
                  {isExpanded && (
                    <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 animate-slideUp">
                      {approval.description}
                    </p>
                  )}
                </div>
              )}

              {/* Submission Time */}
              <p className="text-xs text-gray-500">
                Submitted {new Date(approval.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 ml-4">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 hover:scale-105"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              <span>Approve</span>
            </button>
            
            <button
              onClick={() => setShowRejectionModal(true)}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 hover:scale-105"
            >
              <XCircle size={16} />
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Leave Request
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting {approval.user?.name}'s leave request:
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none transition-colors"
              rows={4}
            />
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isProcessing}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Reject Request'
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                }}
                disabled={isProcessing}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ApprovalItem.displayName = 'ApprovalItem';

// Filters and search component with enhanced loading
const ApprovalFilters = React.memo(({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange,
  filterBy,
  onFilterChange,
  loading = false
}) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 animate-slideUp">
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={loading}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition-colors"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center space-x-2">
        <ArrowUpDown size={16} className="text-gray-400" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          disabled={loading}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm disabled:opacity-50 transition-colors"
        >
          <option value="submitted">Submission Date</option>
          <option value="startDate">Start Date</option>
          <option value="duration">Duration</option>
          <option value="urgency">Urgency</option>
        </select>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <Filter size={16} className="text-gray-400" />
        <select
          value={filterBy}
          onChange={(e) => onFilterChange(e.target.value)}
          disabled={loading}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm disabled:opacity-50 transition-colors"
        >
          <option value="all">All Requests</option>
          <option value="EL">Earned Leave</option>
          <option value="SL">Sick Leave</option>
          <option value="CL">Casual Leave</option>
          <option value="urgent">Urgent Only</option>
        </select>
      </div>
    </div>
  </div>
));

ApprovalFilters.displayName = 'ApprovalFilters';

// Main team approvals component with preload support
const TeamApprovalsWithPreload = React.memo(() => {
  const { approvals, loading, errors, approveLeave, rejectLeave, state } = useTeam();
  const [processingIds, setProcessingIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submitted');
  const [filterBy, setFilterBy] = useState('all');
  const [isDataReady, setIsDataReady] = useState(false);

  // Check if data is ready (either loaded or prefetched)
  useEffect(() => {
    const dataReady = !loading.approvals || state.prefetchStatus.approvals === 'success';
    setIsDataReady(dataReady);
  }, [loading.approvals, state.prefetchStatus.approvals]);

  // Handle approval with loading state
  const handleApprove = useCallback(async (leaveId) => {
    setProcessingIds(prev => new Set(prev).add(leaveId));
    const result = await approveLeave(leaveId);
    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(leaveId);
      return newSet;
    });
    return result;
  }, [approveLeave]);

  // Handle rejection with loading state
  const handleReject = useCallback(async (leaveId, reason) => {
    setProcessingIds(prev => new Set(prev).add(leaveId));
    const result = await rejectLeave(leaveId, reason);
    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(leaveId);
      return newSet;
    });
    return result;
  }, [rejectLeave]);

  // Filter and sort approvals
  const filteredApprovals = useMemo(() => {
    if (!approvals) return [];

    let filtered = [...approvals];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(approval =>
        approval.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterBy !== 'all') {
      if (filterBy === 'urgent') {
        filtered = filtered.filter(approval => {
          const submittedDate = new Date(approval.submittedAt);
          const daysSinceSubmission = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceSubmission > 7;
        });
      } else {
        filtered = filtered.filter(approval => approval.leaveType === filterBy);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'startDate':
          return new Date(a.fromDate) - new Date(b.fromDate);
        case 'duration':
          const aDuration = Math.ceil((new Date(a.toDate) - new Date(a.fromDate)) / (1000 * 60 * 60 * 24));
          const bDuration = Math.ceil((new Date(b.toDate) - new Date(b.fromDate)) / (1000 * 60 * 60 * 24));
          return bDuration - aDuration;
        case 'urgency':
          const getUrgencyScore = (approval) => {
            const submittedDate = new Date(approval.submittedAt);
            return Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
          };
          return getUrgencyScore(b) - getUrgencyScore(a);
        default: // submitted
          return new Date(b.submittedAt) - new Date(a.submittedAt);
      }
    });

    return filtered;
  }, [approvals, searchTerm, sortBy, filterBy]);

  // Enhanced loading state
  if (!isDataReady) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <LoadingSkeleton className="h-6 w-40 mb-2" />
          <LoadingSkeleton className="h-4 w-64" />
        </div>
        
        {/* Filters skeleton */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex space-x-4">
            <LoadingSkeleton className="h-10 flex-1" />
            <LoadingSkeleton className="h-10 w-32" />
            <LoadingSkeleton className="h-10 w-32" />
          </div>
        </div>
        
        {/* Approval items skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
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
  }

  if (errors.approvals) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 animate-fadeIn">
          <XCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-red-900 mb-2">Unable to Load Approvals</h3>
          <p className="text-red-700">{errors.approvals.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Leave Approvals</h2>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve team leave requests
        </p>
      </div>

      {/* Filters */}
      <ApprovalFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        loading={!isDataReady}
      />

      {/* Approvals List */}
      {filteredApprovals.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {approvals?.length === 0 ? 'No Pending Approvals' : 'No Matching Requests'}
          </h3>
          <p className="text-gray-600">
            {approvals?.length === 0 
              ? 'All leave requests have been processed.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary with animation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-slideUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Clock className="text-blue-600" size={20} />
                <div>
                  <p className="font-medium text-blue-900">
                    {filteredApprovals.length} pending request{filteredApprovals.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-blue-700">
                    {filteredApprovals.filter(a => {
                      const submittedDate = new Date(a.submittedAt);
                      const daysSinceSubmission = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
                      return daysSinceSubmission > 7;
                    }).length} urgent • {filteredApprovals.length - filteredApprovals.filter(a => {
                      const submittedDate = new Date(a.submittedAt);
                      const daysSinceSubmission = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
                      return daysSinceSubmission > 7;
                    }).length} normal priority
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Items with staggered animations */}
          {filteredApprovals.map((approval, index) => (
            <ApprovalItem
              key={approval._id}
              approval={approval}
              onApprove={handleApprove}
              onReject={handleReject}
              isProcessing={processingIds.has(approval._id)}
              animationDelay={index * 100}
            />
          ))}
        </div>
      )}

      {/* Preload status indicator */}
      {state.prefetchStatus.approvals === 'success' && (
        <div className="fixed bottom-20 right-6 bg-green-500 text-white px-3 py-1 rounded-full text-xs animate-fadeIn">
          ⚡ Preloaded
        </div>
      )}
    </div>
  );
});

TeamApprovalsWithPreload.displayName = 'TeamApprovalsWithPreload';

export default TeamApprovalsWithPreload;
