import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Calendar, MapPin, 
  User, MessageSquare, Filter, Search, ArrowUpDown, Info
} from 'lucide-react';
import { useTeam } from '../../contexts/TeamContextWithPreload';
import EnhancedLoadingSkeleton, { 
  CardSkeleton, 
  ProgressiveLoader 
} from '../ui/EnhancedLoadingSkeleton';
import ErrorBoundary from '../ui/ErrorBoundary';

// Enhanced approval item with sophisticated animations
const AnimatedApprovalItem = React.memo(({ 
  approval, 
  onApprove, 
  onReject, 
  isProcessing, 
  animationDelay = 0 
}) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [actionState, setActionState] = useState('idle'); // idle, approving, rejecting, success, error

  // Staggered animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const handleApprove = useCallback(async () => {
    if (isProcessing) return;
    
    setActionState('approving');
    const result = await onApprove(approval._id);
    
    if (result.success) {
      setActionState('success');
      // Add success animation delay
      setTimeout(() => setActionState('idle'), 2000);
    } else {
      setActionState('error');
      alert(`Error: ${result.error}`);
      setTimeout(() => setActionState('idle'), 1000);
    }
  }, [approval._id, onApprove, isProcessing]);

  const handleReject = useCallback(async () => {
    if (!rejectionReason.trim()) {
      // Add wiggle animation for validation error
      const reasonInput = document.querySelector('[data-rejection-reason]');
      if (reasonInput) {
        reasonInput.classList.add('wiggle');
        setTimeout(() => reasonInput.classList.remove('wiggle'), 600);
      }
      return;
    }
    
    setActionState('rejecting');
    const result = await onReject(approval._id, rejectionReason.trim());
    
    if (result.success) {
      setActionState('success');
      setShowRejectionModal(false);
      setRejectionReason('');
      setTimeout(() => setActionState('idle'), 2000);
    } else {
      setActionState('error');
      alert(`Error: ${result.error}`);
      setTimeout(() => setActionState('idle'), 1000);
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

  // Format dates with animation
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Get urgency level with enhanced logic
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

  // Loading skeleton with staggered animation
  if (!isVisible) {
    return (
      <CardSkeleton 
        delay={animationDelay}
        hasHeader
        hasFooter
        contentLines={3}
        className="animate-fadeInUp"
      />
    );
  }

  return (
    <div 
      className={`
        bg-white rounded-lg border transition-all duration-300 gpu-accelerated overflow-hidden
        ${urgencyLevel === 'high' ? 'border-red-200 shadow-red-50' :
          urgencyLevel === 'medium' ? 'border-orange-200 shadow-orange-50' :
          'border-gray-200'}
        ${isHovered ? 'hover-lift shadow-lg' : 'hover:shadow-md'}
        ${actionState === 'success' ? 'animate-fadeInScale bg-green-50 border-green-300' : ''}
        ${actionState === 'error' ? 'wiggle' : ''}
        animate-fadeInUp
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Priority indicator bar */}
      <div 
        className={`
          h-1 w-full transition-all duration-500
          ${urgencyLevel === 'high' ? 'bg-red-500' :
            urgencyLevel === 'medium' ? 'bg-orange-500' :
            'bg-green-500'}
        `}
      />
      
      <div className="p-6">
        {/* Header with enhanced animations */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Animated Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md hover-scale transition-transform duration-200 animate-fadeInScale animate-delay-100">
              {approval.user?.name?.charAt(0) || approval.user?.email?.charAt(0) || 'U'}
            </div>

            {/* Details with staggered animations */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1 animate-fadeInLeft animate-delay-200">
                <h3 className="font-semibold text-gray-900 truncate">
                  {approval.user?.name || 'Unknown User'}
                </h3>
                <span 
                  className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-all duration-200
                    ${urgencyColors[urgencyLevel]}
                    ${isHovered ? 'scale-105' : ''}
                  `}
                >
                  {urgencyLevel === 'high' ? 'Urgent' :
                   urgencyLevel === 'medium' ? 'Medium' : 'Normal'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 animate-fadeInLeft animate-delay-300">
                {approval.user?.email}
              </p>

              {/* Leave Details with enhanced animations */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center animate-fadeInUp animate-delay-400">
                  <Calendar size={14} className="mr-1 text-gray-400" />
                  <span>{formatDate(approval.fromDate)} - {formatDate(approval.toDate)}</span>
                </div>
                
                <div className="flex items-center animate-fadeInUp animate-delay-450">
                  <Clock size={14} className="mr-1 text-gray-400" />
                  <span className="font-medium">{leaveDuration} days</span>
                </div>
                
                <div className="flex items-center animate-fadeInUp animate-delay-500">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium transition-all duration-200
                    ${approval.leaveType === 'EL' ? 'bg-blue-100 text-blue-700' :
                      approval.leaveType === 'SL' ? 'bg-green-100 text-green-700' :
                      approval.leaveType === 'CL' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'}
                    ${isHovered ? 'scale-105' : ''}
                  `}>
                    {approval.leaveType}
                  </span>
                </div>
              </div>

              {/* Destination with animation */}
              {approval.destination && (
                <div className="flex items-center text-sm text-gray-600 mb-3 animate-fadeInLeft animate-delay-550">
                  <MapPin size={14} className="mr-1 text-gray-400" />
                  <span>{approval.destination}</span>
                </div>
              )}

              {/* Description toggle with animation */}
              {approval.description && (
                <div className="mb-3 animate-fadeInUp animate-delay-600">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 hover-scale"
                  >
                    <MessageSquare size={14} className="mr-1" />
                    <span>{isExpanded ? 'Hide' : 'View'} description</span>
                  </button>
                  
                  {isExpanded && (
                    <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 animate-slideDown">
                      {approval.description}
                    </p>
                  )}
                </div>
              )}

              {/* Submission Time with enhanced formatting */}
              <p className="text-xs text-gray-500 animate-fadeInUp animate-delay-650">
                Submitted {new Date(approval.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex space-x-2 ml-4 animate-fadeInRight animate-delay-300">
            <button
              onClick={handleApprove}
              disabled={isProcessing || actionState !== 'idle'}
              className={`
                px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 button-press
                ${actionState === 'success' ? 'bg-green-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
                ${actionState === 'approving' ? 'bg-green-700 cursor-wait' : ''}
                disabled:opacity-50 disabled:cursor-not-allowed hover-lift
              `}
            >
              {actionState === 'approving' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : actionState === 'success' ? (
                <CheckCircle size={16} className="animate-fadeInScale" />
              ) : (
                <CheckCircle size={16} />
              )}
              <span>
                {actionState === 'approving' ? 'Approving...' : 
                 actionState === 'success' ? 'Approved!' : 'Approve'}
              </span>
            </button>
            
            <button
              onClick={() => setShowRejectionModal(true)}
              disabled={isProcessing || actionState !== 'idle'}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 hover-lift button-press"
            >
              <XCircle size={16} />
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Rejection Modal with animations */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fadeInScale">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 animate-fadeInUp">
              Reject Leave Request
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 animate-fadeInUp animate-delay-100">
              Please provide a reason for rejecting {approval.user?.name}'s leave request:
            </p>
            
            <textarea
              data-rejection-reason
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none transition-all duration-200 hover-glow animate-fadeInUp animate-delay-200"
              rows={4}
            />
            
            <div className="flex space-x-3 mt-6 animate-fadeInUp animate-delay-300">
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionState === 'rejecting'}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 button-press hover-lift
                  ${actionState === 'rejecting' ? 'bg-red-700 cursor-wait' : 'bg-red-600 hover:bg-red-700'}
                  text-white disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {actionState === 'rejecting' ? (
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
                disabled={actionState === 'rejecting'}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 button-press hover-lift"
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

AnimatedApprovalItem.displayName = 'AnimatedApprovalItem';

// Enhanced filters with smooth animations
const AnimatedApprovalFilters = React.memo(({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange,
  filterBy,
  onFilterChange,
  loading = false
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 ${isVisible ? 'animate-slideDown' : 'opacity-0'}`}>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 stagger-fast">
        {/* Search with enhanced animations */}
        <div className="relative flex-1 animate-fadeInUp animate-delay-100">
          <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200 ${searchTerm ? 'text-blue-500' : ''}`} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition-all duration-200 hover-glow"
          />
        </div>

        {/* Sort with animation */}
        <div className="flex items-center space-x-2 animate-fadeInUp animate-delay-200">
          <ArrowUpDown size={16} className="text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm disabled:opacity-50 transition-all duration-200 hover-glow"
          >
            <option value="submitted">Submission Date</option>
            <option value="startDate">Start Date</option>
            <option value="duration">Duration</option>
            <option value="urgency">Urgency</option>
          </select>
        </div>

        {/* Filter with animation */}
        <div className="flex items-center space-x-2 animate-fadeInUp animate-delay-300">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterBy}
            onChange={(e) => onFilterChange(e.target.value)}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm disabled:opacity-50 transition-all duration-200 hover-glow"
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
  );
});

AnimatedApprovalFilters.displayName = 'AnimatedApprovalFilters';

// Main animated approvals component
const TeamApprovalsAnimated = React.memo(() => {
  const { approvals, loading, errors, approveLeave, rejectLeave, state } = useTeam();
  const [processingIds, setProcessingIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submitted');
  const [filterBy, setFilterBy] = useState('all');
  const [isDataReady, setIsDataReady] = useState(false);

  // Enhanced data ready check
  useEffect(() => {
    const dataReady = !loading.approvals || state.prefetchStatus.approvals === 'success';
    setIsDataReady(dataReady);
  }, [loading.approvals, state.prefetchStatus.approvals]);

  // Handle approval with enhanced state management
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

  // Handle rejection with enhanced state management
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

  // Enhanced filtering and sorting
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

    // Sort with enhanced logic
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

  // Enhanced loading state with comprehensive skeleton
  if (!isDataReady) {
    return (
      <div className="p-6 animate-fadeIn">
        <div className="mb-6">
          <EnhancedLoadingSkeleton height="1.5rem" width="10rem" className="mb-2" />
          <EnhancedLoadingSkeleton height="1rem" width="16rem" delay={100} />
        </div>
        
        {/* Filters skeleton */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex space-x-4">
            <EnhancedLoadingSkeleton height="2.5rem" className="flex-1" />
            <EnhancedLoadingSkeleton height="2.5rem" width="8rem" delay={100} />
            <EnhancedLoadingSkeleton height="2.5rem" width="8rem" delay={200} />
          </div>
        </div>
        
        {/* Approval items skeleton */}
        <div className="space-y-4 stagger-children">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton 
              key={i} 
              delay={300 + (i * 150)}
              hasHeader
              hasFooter
              contentLines={3}
            />
          ))}
        </div>
      </div>
    );
  }

  if (errors.approvals) {
    return (
      <div className="p-6 text-center animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 wiggle">
          <XCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-red-900 mb-2">Unable to Load Approvals</h3>
          <p className="text-red-700">{errors.approvals.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fadeIn">
      {/* Animated Header */}
      <div className="mb-6 animate-fadeInUp">
        <h2 className="text-xl font-semibold text-gray-900">Leave Approvals</h2>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve team leave requests
        </p>
      </div>

      {/* Enhanced Filters */}
      <AnimatedApprovalFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        loading={!isDataReady}
      />

      {/* Approvals List with comprehensive states */}
      {filteredApprovals.length === 0 ? (
        <div className="text-center py-12 animate-progressiveReveal">
          <CheckCircle className="mx-auto text-gray-400 mb-4 animate-fadeInScale animate-delay-200" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2 animate-fadeInUp animate-delay-300">
            {approvals?.length === 0 ? 'No Pending Approvals' : 'No Matching Requests'}
          </h3>
          <p className="text-gray-600 animate-fadeInUp animate-delay-400">
            {approvals?.length === 0 
              ? 'All leave requests have been processed.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Enhanced Summary with animations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-slideUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 animate-fadeInLeft">
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

          {/* Approval Items with sophisticated animations */}
          {filteredApprovals.map((approval, index) => (
            <AnimatedApprovalItem
              key={approval._id}
              approval={approval}
              onApprove={handleApprove}
              onReject={handleReject}
              isProcessing={processingIds.has(approval._id)}
              animationDelay={index * 150}
            />
          ))}
        </div>
      )}

      {/* Preload status indicator with celebration */}
      {state.prefetchStatus.approvals === 'success' && (
        <div className="fixed bottom-20 right-6 bg-green-500 text-white px-3 py-1 rounded-full text-xs animate-fadeInScale gentle-bounce">
          ⚡ Approvals Ready
        </div>
      )}
    </div>
  );
});

TeamApprovalsAnimated.displayName = 'TeamApprovalsAnimated';

export default TeamApprovalsAnimated;
