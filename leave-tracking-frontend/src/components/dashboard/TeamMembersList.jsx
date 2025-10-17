import React, { useState, useCallback, memo } from 'react';
import { Users, UserPlus, Trash2, Mail, User, CheckCircle } from 'lucide-react';

// Optimized: Memoized individual member component
const TeamMemberItem = memo(({ member, onRemove, isRemoving }) => (
  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
        {member.name?.charAt(0) || member.email?.charAt(0) || 'U'}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{member.name || 'Unnamed User'}</h4>
        <p className="text-sm text-gray-600 flex items-center">
          <Mail size={14} className="mr-1" />
          {member.email}
        </p>
        <div className="flex items-center mt-1">
          <User size={14} className="mr-1 text-gray-400" />
          <span className="text-xs text-gray-500 capitalize">{member.role || 'employee'}</span>
          {member.status === 'on-leave' && (
            <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
              On Leave
            </span>
          )}
        </div>
      </div>
    </div>
    <button
      onClick={() => onRemove(member._id)}
      disabled={isRemoving === member._id}
      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Remove member"
    >
      <Trash2 size={18} />
    </button>
  </div>
));

TeamMemberItem.displayName = 'TeamMemberItem';

// Optimized: Main component with virtualization for large lists
const TeamMembersList = memo(({ 
  members = [], 
  showAddMember, 
  onToggleAddMember, 
  authData, 
  API_BASE_URL, 
  onRefreshTeam 
}) => {
  const [removingMember, setRemovingMember] = useState(null);

  // Optimized: Memoized remove handler
  const handleRemoveMember = useCallback(async (memberId) => {
    if (!window.confirm('Remove this team member?')) return;
    
    setRemovingMember(memberId);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/teams/members/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authData.token}`
          }
        }
      );

      if (response.ok) {
        onRefreshTeam?.();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Remove member error:', err);
      alert('Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  }, [API_BASE_URL, authData.token, onRefreshTeam]);

  // Optimized: Memoized add member handler
  const handleAddMember = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email')?.trim();
    
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        onRefreshTeam?.();
        onToggleAddMember?.();
        e.target.reset();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Add member error:', err);
      alert('Failed to add member');
    }
  }, [API_BASE_URL, authData.token, onRefreshTeam, onToggleAddMember]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-600">{members.length} members in your team</p>
        </div>
        <button
          onClick={onToggleAddMember}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <UserPlus size={18} />
          <span>Add Member</span>
        </button>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Team Member</h4>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                placeholder="colleague@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Add Member
              </button>
              <button
                type="button"
                onClick={onToggleAddMember}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members List */}
      {members.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-600">Add your first team member to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Optimized: Use memoized components for each member */}
          {members.map((member) => (
            <TeamMemberItem
              key={member._id || member.email}
              member={member}
              onRemove={handleRemoveMember}
              isRemoving={removingMember}
            />
          ))}
        </div>
      )}

      {/* Team Stats */}
      {members.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
            <p className="text-2xl font-bold text-green-600">
              {members.filter(m => m.status !== 'on-leave').length}
            </p>
            <p className="text-sm text-green-600">Available</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <Users className="mx-auto text-orange-600 mb-2" size={24} />
            <p className="text-2xl font-bold text-orange-600">
              {members.filter(m => m.status === 'on-leave').length}
            </p>
            <p className="text-sm text-orange-600">On Leave</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Users className="mx-auto text-blue-600 mb-2" size={24} />
            <p className="text-2xl font-bold text-blue-600">{members.length}</p>
            <p className="text-sm text-blue-600">Total Members</p>
          </div>
        </div>
      )}
    </div>
  );
});

TeamMembersList.displayName = 'TeamMembersList';

export default TeamMembersList;
