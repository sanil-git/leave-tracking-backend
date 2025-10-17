import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { 
  Users, UserPlus, Mail, User, Trash2, Search, Filter,
  CheckCircle, XCircle, Clock, MoreHorizontal
} from 'lucide-react';
import { useTeam } from '../../contexts/TeamContextWithPreload';
import LoadingSkeleton from '../ui/LoadingSkeleton';

// Memoized member item component with enhanced loading states
const MemberItem = React.memo(({ index, style, data }) => {
  const { members, removeTeamMember, loading } = data;
  const member = members[index];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection observer for lazy rendering of member details
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50); // Stagger animations
    return () => clearTimeout(timer);
  }, [index]);

  const handleRemove = useCallback(async () => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return;
    
    setIsRemoving(true);
    const result = await removeTeamMember(member._id);
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
    setIsRemoving(false);
    setIsMenuOpen(false);
  }, [member, removeTeamMember]);

  // Status indicator with animation
  const getStatusIndicator = useCallback((status) => {
    switch (status) {
      case 'on-leave':
        return <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />;
      case 'available':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  }, []);

  // Generate avatar initials
  const getAvatarInitials = useCallback((name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email ? email.slice(0, 2).toUpperCase() : 'U';
  }, []);

  // Loading state for member item
  if (!isVisible) {
    return (
      <div style={style}>
        <div className="mx-4 my-2 bg-gray-50 rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <LoadingSkeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <LoadingSkeleton className="h-4 w-32 mb-2" />
              <LoadingSkeleton className="h-3 w-48 mb-1" />
              <LoadingSkeleton className="h-3 w-24" />
            </div>
            <LoadingSkeleton className="w-8 h-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={style}>
      <div className="mx-4 my-2 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-200 animate-fadeIn">
        <div className="p-4 flex items-center justify-between">
          {/* Member Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {getAvatarInitials(member.name, member.email)}
              </div>
              <div className="absolute -bottom-1 -right-1">
                {getStatusIndicator(member.status)}
              </div>
            </div>

            {/* Member Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900 truncate">
                  {member.name || 'Unnamed User'}
                </h4>
                {member.status === 'on-leave' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 animate-fadeIn">
                    On Leave
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Mail size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
              
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <User size={12} className="mr-1 flex-shrink-0" />
                <span className="capitalize">{member.role || 'employee'}</span>
                {member.department && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{member.department}</span>
                  </>
                )}
              </div>
            </div>

            {/* Member Stats - Enhanced with loading states */}
            <div className="hidden md:flex flex-col items-end text-xs text-gray-500 space-y-1">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {member.leaveBalance?.total ?? (
                      <LoadingSkeleton className="w-4 h-4" />
                    )}
                  </div>
                  <div>Days left</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {member.leavesThisYear ?? (
                      <LoadingSkeleton className="w-4 h-4" />
                    )}
                  </div>
                  <div>This year</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex-shrink-0 ml-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              disabled={isRemoving}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isRemoving ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <MoreHorizontal size={16} />
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 animate-scaleIn">
                <div className="py-1">
                  <button
                    onClick={() => {
                      // Handle edit member
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User size={14} className="mr-2" />
                    Edit Member
                  </button>
                  
                  <button
                    onClick={() => {
                      // Handle view leave history
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Clock size={14} className="mr-2" />
                    Leave History
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={handleRemove}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Remove Member
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MemberItem.displayName = 'MemberItem';

// Search and filter controls with enhanced loading states
const MemberControls = React.memo(() => {
  const { state, setFilter, toggleModal, loading } = useTeam();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="p-6 border-b border-gray-200 bg-gray-50/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-600">Manage your team and their permissions</p>
        </div>
        
        <button
          onClick={() => toggleModal('addMember')}
          disabled={loading.any}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <UserPlus size={18} />
          <span>Add Member</span>
          {loading.any && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
          )}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 animate-slideUp">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={state.filters.memberStatus}
                onChange={(e) => setFilter('memberStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-colors"
              >
                <option value="all">All Members</option>
                <option value="available">Available</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-colors"
              >
                <option value="all">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MemberControls.displayName = 'MemberControls';

// Main virtualized member list component with preload support
const VirtualizedMemberListWithPreload = React.memo(() => {
  const { members, allMembers, removeTeamMember, loading, teamStats, state } = useTeam();
  const [isDataReady, setIsDataReady] = useState(false);

  // Check if data is ready (either loaded from SWR or prefetched)
  useEffect(() => {
    const dataReady = !loading.team || state.prefetchStatus.members === 'success';
    setIsDataReady(dataReady);
  }, [loading.team, state.prefetchStatus.members]);

  // Memoized data for virtual list
  const listData = useMemo(() => ({
    members,
    removeTeamMember,
    loading
  }), [members, removeTeamMember, loading]);

  // Calculate list height (max 400px, min 200px)
  const listHeight = useMemo(() => {
    const itemHeight = 88; // Height per item including margin
    const maxItems = 5; // Show max 5 items before scrolling
    const calculatedHeight = Math.min(members.length * itemHeight, maxItems * itemHeight);
    return Math.max(calculatedHeight, 200);
  }, [members.length]);

  // Enhanced loading state that considers prefetch status
  if (!isDataReady) {
    return (
      <div>
        <MemberControls />
        <div className="p-6">
          <div className="animate-pulse">
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                  <LoadingSkeleton className="w-5 h-5 mx-auto mb-1" />
                  <LoadingSkeleton className="h-6 w-8 mx-auto mb-1" />
                  <LoadingSkeleton className="h-3 w-12 mx-auto" />
                </div>
              ))}
            </div>
            
            {/* Member list skeleton */}
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
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div>
        <MemberControls />
        <div className="p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-600 mb-4">Add your first team member to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MemberControls />
      
      {/* Team Stats with enhanced animations */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center card-hover animate-fadeIn">
            <Users className="mx-auto text-blue-600 mb-1" size={20} />
            <p className="text-lg font-bold text-blue-600">{teamStats.totalMembers}</p>
            <p className="text-xs text-blue-600">Total Members</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 text-center card-hover animate-fadeIn animation-delay-100">
            <CheckCircle className="mx-auto text-green-600 mb-1" size={20} />
            <p className="text-lg font-bold text-green-600">{teamStats.availableMembers}</p>
            <p className="text-xs text-green-600">Available</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3 text-center card-hover animate-fadeIn animation-delay-200">
            <XCircle className="mx-auto text-orange-600 mb-1" size={20} />
            <p className="text-lg font-bold text-orange-600">{teamStats.onLeaveMembers}</p>
            <p className="text-xs text-orange-600">On Leave</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 text-center card-hover animate-fadeIn animation-delay-300">
            <Clock className="mx-auto text-purple-600 mb-1" size={20} />
            <p className="text-lg font-bold text-purple-600">{teamStats.pendingApprovals}</p>
            <p className="text-xs text-purple-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Virtual List with enhanced animations */}
      <div className="p-4">
        <List
          height={listHeight}
          itemCount={members.length}
          itemSize={88}
          itemData={listData}
          className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {MemberItem}
        </List>
        
        {/* Performance indicator */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Showing {members.length} of {allMembers.length} members • Virtual scrolling enabled
          </p>
        </div>
      </div>
    </div>
  );
});

VirtualizedMemberListWithPreload.displayName = 'VirtualizedMemberListWithPreload';

export default VirtualizedMemberListWithPreload;
