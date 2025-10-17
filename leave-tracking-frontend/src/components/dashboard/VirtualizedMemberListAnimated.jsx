import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { 
  Users, UserPlus, Mail, User, Trash2, Search, Filter,
  CheckCircle, XCircle, Clock, MoreHorizontal
} from 'lucide-react';
import { useTeam } from '../../contexts/TeamContextWithPreload';
import EnhancedLoadingSkeleton, { ListItemSkeleton, MetricCardSkeleton, ProgressiveLoader } from '../ui/EnhancedLoadingSkeleton';

// Animated member item with staggered loading and micro-interactions
const AnimatedMemberItem = React.memo(({ index, style, data }) => {
  const { members, removeTeamMember, loading } = data;
  const member = members[index];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Staggered visibility animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50);
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

  // Status indicator with enhanced animations
  const getStatusIndicator = useCallback((status) => {
    const baseClasses = "w-2 h-2 rounded-full transition-all duration-300";
    switch (status) {
      case 'on-leave':
        return <div className={`${baseClasses} bg-orange-500 animate-pulse`} />;
      case 'available':
        return <div className={`${baseClasses} bg-green-500 animate-pulse`} />;
      default:
        return <div className={`${baseClasses} bg-gray-400`} />;
    }
  }, []);

  // Avatar initials generator
  const getAvatarInitials = useCallback((name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email ? email.slice(0, 2).toUpperCase() : 'U';
  }, []);

  // Loading skeleton for member item
  if (!isVisible) {
    return (
      <div style={style}>
        <ListItemSkeleton 
          delay={index * 50}
          className="mx-4 my-2 bg-white rounded-lg border border-gray-200 animate-fadeInUp"
        />
      </div>
    );
  }

  return (
    <div style={style}>
      <div 
        className={`
          mx-4 my-2 bg-white rounded-lg border border-gray-200 transition-all duration-300 gpu-accelerated
          ${isHovered ? 'hover-lift shadow-md border-blue-200' : 'hover:border-blue-100'}
          animate-fadeInUp
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsMenuOpen(false);
        }}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="p-4 flex items-center justify-between">
          {/* Member Info with enhanced animations */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Animated Avatar */}
            <div className="relative flex-shrink-0 group">
              <div className={`
                w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full 
                flex items-center justify-center text-white font-semibold text-sm shadow-md
                transition-transform duration-200 
                ${isHovered ? 'hover-scale' : ''}
              `}>
                {getAvatarInitials(member.name, member.email)}
              </div>
              <div className="absolute -bottom-1 -right-1 transition-transform duration-200">
                {getStatusIndicator(member.status)}
              </div>
            </div>

            {/* Member Details with staggered animations */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 animate-fadeInLeft animate-delay-100">
                <h4 className="font-semibold text-gray-900 truncate transition-colors duration-200 hover:text-blue-600">
                  {member.name || 'Unnamed User'}
                </h4>
                {member.status === 'on-leave' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 animate-fadeInScale animate-delay-200">
                    On Leave
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mt-1 animate-fadeInLeft animate-delay-200">
                <Mail size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
              
              <div className="flex items-center text-xs text-gray-500 mt-1 animate-fadeInLeft animate-delay-300">
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

            {/* Member Stats with enhanced loading states */}
            <div className="hidden md:flex flex-col items-end text-xs text-gray-500 space-y-1 animate-fadeInRight animate-delay-400">
              <div className="flex items-center space-x-4">
                <div className="text-center hover-scale transition-transform duration-200">
                  <div className="font-semibold text-gray-900">
                    {member.leaveBalance?.total ?? (
                      <EnhancedLoadingSkeleton width="1rem" height="1rem" variant="pulse" />
                    )}
                  </div>
                  <div>Days left</div>
                </div>
                <div className="text-center hover-scale transition-transform duration-200">
                  <div className="font-semibold text-gray-900">
                    {member.leavesThisYear ?? (
                      <EnhancedLoadingSkeleton width="1rem" height="1rem" variant="pulse" />
                    )}
                  </div>
                  <div>This year</div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Actions */}
          <div className="relative flex-shrink-0 ml-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              disabled={isRemoving}
              className={`
                p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 disabled:opacity-50
                ${isHovered ? 'hover-scale' : ''}
                ${isMenuOpen ? 'bg-gray-100' : ''}
              `}
            >
              {isRemoving ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <MoreHorizontal size={16} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`} />
              )}
            </button>

            {/* Animated Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 animate-fadeInScale">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  >
                    <User size={14} className="mr-2" />
                    Edit Member
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  >
                    <Clock size={14} className="mr-2" />
                    Leave History
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={handleRemove}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
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

AnimatedMemberItem.displayName = 'AnimatedMemberItem';

// Enhanced search and filter controls with animations
const AnimatedMemberControls = React.memo(() => {
  const { state, setFilter, toggleModal, loading } = useTeam();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`p-6 border-b border-gray-200 bg-gray-50/50 ${isLoaded ? 'animate-slideDown' : 'opacity-0'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="animate-fadeInLeft">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-600">Manage your team and their permissions</p>
        </div>
        
        <button
          onClick={() => toggleModal('addMember')}
          disabled={loading.any}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 hover-lift button-press animate-fadeInRight"
        >
          <UserPlus size={18} />
          <span>Add Member</span>
          {loading.any && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
          )}
        </button>
      </div>

      {/* Animated Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-4 stagger-fast">
        {/* Search with icon animation */}
        <div className="relative flex-1 animate-fadeInUp animate-delay-100">
          <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200 ${searchTerm ? 'text-blue-500' : ''}`} />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 hover-glow"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 animate-fadeInScale"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* Filter Toggle with animation */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 hover-scale button-press animate-fadeInUp animate-delay-200
            ${showFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <Filter size={18} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          <span>Filters</span>
        </button>
      </div>

      {/* Animated Filter Options */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 animate-slideDown animate-delay-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-fast">
            <div className="animate-fadeInUp animate-delay-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={state.filters.memberStatus}
                onChange={(e) => setFilter('memberStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all duration-200 hover-glow"
              >
                <option value="all">All Members</option>
                <option value="available">Available</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>

            <div className="animate-fadeInUp animate-delay-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all duration-200 hover-glow">
                <option value="all">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="animate-fadeInUp animate-delay-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all duration-200 hover-glow">
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

AnimatedMemberControls.displayName = 'AnimatedMemberControls';

// Main animated virtualized member list
const VirtualizedMemberListAnimated = React.memo(() => {
  const { members, allMembers, removeTeamMember, loading, teamStats, state } = useTeam();
  const [isDataReady, setIsDataReady] = useState(false);

  // Enhanced data ready check
  useEffect(() => {
    const dataReady = !loading.team || state.prefetchStatus.members === 'success';
    setIsDataReady(dataReady);
    
    if (dataReady && members.length > 0) {
      console.log('🎨 Member list animations ready');
    }
  }, [loading.team, state.prefetchStatus.members, members.length]);

  // Memoized list data
  const listData = useMemo(() => ({
    members,
    removeTeamMember,
    loading
  }), [members, removeTeamMember, loading]);

  // Dynamic list height calculation
  const listHeight = useMemo(() => {
    const itemHeight = 88;
    const maxItems = 5;
    const calculatedHeight = Math.min(members.length * itemHeight, maxItems * itemHeight);
    return Math.max(calculatedHeight, 200);
  }, [members.length]);

  return (
    <div className="animate-fadeInUp">
      <AnimatedMemberControls />
      
      <ProgressiveLoader
        isLoading={!isDataReady}
        skeleton={
          <div className="p-6">
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 stagger-fast">
              {[...Array(4)].map((_, i) => (
                <MetricCardSkeleton key={i} delay={i * 100} />
              ))}
            </div>
            
            {/* Member list skeleton */}
            <div className="space-y-3 stagger-children">
              {[...Array(5)].map((_, i) => (
                <ListItemSkeleton key={i} delay={400 + (i * 100)} />
              ))}
            </div>
          </div>
        }
        fadeTransition
      >
        {members.length === 0 ? (
          <div className="p-12 text-center animate-progressiveReveal">
            <Users className="mx-auto text-gray-400 mb-4 animate-fadeInScale animate-delay-200" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2 animate-fadeInUp animate-delay-300">
              No team members yet
            </h3>
            <p className="text-gray-600 mb-4 animate-fadeInUp animate-delay-400">
              Add your first team member to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Animated Team Stats */}
            <div className="px-6 py-4 bg-white border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 stagger-fast">
                <div className="bg-blue-50 rounded-lg p-3 text-center hover-lift transition-all duration-200 animate-fadeInUp animate-delay-100">
                  <Users className="mx-auto text-blue-600 mb-1" size={20} />
                  <p className="text-lg font-bold text-blue-600">{teamStats.totalMembers}</p>
                  <p className="text-xs text-blue-600">Total Members</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3 text-center hover-lift transition-all duration-200 animate-fadeInUp animate-delay-200">
                  <CheckCircle className="mx-auto text-green-600 mb-1" size={20} />
                  <p className="text-lg font-bold text-green-600">{teamStats.availableMembers}</p>
                  <p className="text-xs text-green-600">Available</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-3 text-center hover-lift transition-all duration-200 animate-fadeInUp animate-delay-300">
                  <XCircle className="mx-auto text-orange-600 mb-1" size={20} />
                  <p className="text-lg font-bold text-orange-600">{teamStats.onLeaveMembers}</p>
                  <p className="text-xs text-orange-600">On Leave</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-3 text-center hover-lift transition-all duration-200 animate-fadeInUp animate-delay-400">
                  <Clock className="mx-auto text-purple-600 mb-1" size={20} />
                  <p className="text-lg font-bold text-purple-600">{teamStats.pendingApprovals}</p>
                  <p className="text-xs text-purple-600">Pending</p>
                </div>
              </div>
            </div>

            {/* Enhanced Virtual List */}
            <div className="p-4 animate-fadeInUp animate-delay-300">
              <List
                height={listHeight}
                itemCount={members.length}
                itemSize={88}
                itemData={listData}
                className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 smooth-scroll"
              >
                {AnimatedMemberItem}
              </List>
              
              {/* Performance indicator with animation */}
              <div className="mt-4 text-center animate-fadeInUp animate-delay-500">
                <p className="text-xs text-gray-500">
                  Showing {members.length} of {allMembers.length} members • Virtual scrolling enabled
                  <span className="ml-2 text-green-600">⚡ Optimized for performance</span>
                </p>
              </div>
            </div>
          </>
        )}
      </ProgressiveLoader>
    </div>
  );
});

VirtualizedMemberListAnimated.displayName = 'VirtualizedMemberListAnimated';

export default VirtualizedMemberListAnimated;
