import React, { useState, useEffect } from 'react';
import { Users, Calendar, Trash2, UserPlus, CheckCircle, XCircle, BarChart3, Loader2, Clock, Key } from 'lucide-react';
import LeaveApprovalPanel from '../LeaveApprovalPanel';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://leave-tracking-backend.onrender.com');

// MOCK DATA - Replace with API calls later
// eslint-disable-next-line no-unused-vars
const MOCK_TEAM = {
  name: 'Engineering Team',
  manager: 'Current User',
  members: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@company.com',
      role: 'Backend Developer',
      status: 'available',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      role: 'Frontend Developer',
      status: 'on-leave',
      avatar: 'SC'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@company.com',
      role: 'Full Stack Developer',
      status: 'available',
      avatar: 'MJ'
    },
    {
      id: 4,
      name: 'Priya Sharma',
      email: 'priya@company.com',
      role: 'DevOps Engineer',
      status: 'available',
      avatar: 'PS'
    }
  ]
};

// eslint-disable-next-line no-unused-vars
const MOCK_TEAM_LEAVES = [
  {
    id: 1,
    memberName: 'Sarah Chen',
    destination: 'Bali',
    fromDate: '2025-10-15',
    toDate: '2025-10-25',
    days: 8,
    leaveType: 'EL',
    status: 'current'
  },
  {
    id: 2,
    memberName: 'John Doe',
    destination: 'Goa',
    fromDate: '2025-12-20',
    toDate: '2025-12-28',
    days: 6,
    leaveType: 'EL',
    status: 'upcoming'
  },
  {
    id: 3,
    memberName: 'Mike Johnson',
    destination: 'Kashmir',
    fromDate: '2025-11-10',
    toDate: '2025-11-18',
    days: 7,
    leaveType: 'EL',
    status: 'upcoming'
  }
];

function MyTeam() {
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'analytics', or 'approvals'
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real data from API
  const [teamData, setTeamData] = useState(null);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [pendingUsers, setPendingUsers] = useState([]);

  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Get user info from AuthContext
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch pending approvals count
  const fetchPendingApprovalsCount = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/leaves/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const pendingLeaves = await response.json();
        setPendingApprovalsCount(pendingLeaves.length);
      } else {
        setPendingApprovalsCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending approvals count:', error);
      setPendingApprovalsCount(0);
    }
  };

  // Fetch pending users with temporary passwords
  const fetchPendingUsers = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/temp-passwords`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.users || []);
      }
    } catch (err) {
      console.error('Fetch pending users error:', err);
    }
  };

  // Fetch team data - OPTIMIZED: Parallel requests
  useEffect(() => {
    if (token) {
      // Run all API calls in parallel for faster loading
      Promise.allSettled([
        fetchTeamData(),
        fetchPendingApprovalsCount(),
        fetchPendingUsers()
      ]).then(() => {
        // All requests completed (success or failure)
        console.log('All team data requests completed');
      });
    } else {
      setError('Please log in to view team data.');
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Run when token changes

  const fetchTeamData = async () => {
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/teams/my-team`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Team data received from API:', data);
        setTeamData(data);
      } else if (response.status === 404) {
        // 404 is expected when user has no team - don't set as error, just set teamData to null
        setTeamData(null);
        setError(null);
      } else if (response.status === 403) {
        setError('Manager access required.');
      } else {
        setError('Failed to load team data.');
      }
    } catch (err) {
      console.error('Fetch team error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch team leaves
  const fetchTeamLeaves = async () => {
    if (!teamData?.teamId || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamData.teamId}/leaves`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Team leaves received:', {
          leaves: data.leaves,
          statistics: data.statistics,
          leavesCount: data.leaves?.length || 0
        });
        setTeamLeaves(data.leaves);
        setStatistics(data.statistics);
      } else {
        console.error('Failed to fetch team leaves');
      }
    } catch (err) {
      console.error('Fetch team leaves error:', err);
    }
  };

  // Fetch leaves when switching to analytics tab or when team data loads
  useEffect(() => {
    console.log('Team leaves useEffect triggered:', { activeTab, teamData: !!teamData });
    if ((activeTab === 'analytics' || activeTab === 'leaves') && teamData) {
      console.log('Calling fetchTeamLeaves...');
      fetchTeamLeaves();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, teamData]);

  // Create team handler
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const teamName = formData.get('teamName');
    const description = formData.get('description');

    if (!teamName || teamName.trim().length === 0) {
      alert('Please enter a team name');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: teamName.trim(),
          description: description?.trim() || ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTeamData(data.team);
        setShowCreateTeam(false);
        alert('✅ Team created successfully! You can now add team members.');
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Create team error:', err);
      alert('❌ Failed to create team. Please try again.');
    }
  };

  // Real handlers
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this team member?')) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/teams/${teamData.teamId}/members/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        // Refresh team data
        fetchTeamData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Remove member error:', err);
      alert('Failed to remove member');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userEmail = formData.get('email');
    const position = formData.get('position') || 'Employee';
    // Access role will be automatically set to 'employee' for new team members
    // Only admins can change roles via the admin panel

    console.log('Adding member with:', { userEmail, position, teamId: teamData.teamId });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/teams/${teamData.teamId}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userEmail, position })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShowAddMember(false);
        // Refresh team data
        fetchTeamData();
        
        // Show success message with details about new user creation
        if (data.wasNewUser && data.tempPassword) {
          alert(`✅ New user created and added to team!\n\n👤 User: ${data.member.name} (${data.member.email})\n🏷️ Access Role: ${data.member.role}\n💼 Position: ${data.member.position}\n🔐 Temporary Password: ${data.tempPassword}\n\n📧 Please share these login credentials with the new user. They should change their password on first login.`);
        } else {
          alert(`✅ Member added to team successfully!\n\n👤 User: ${data.member.name} (${data.member.email})\n🏷️ Access Role: ${data.member.role}\n💼 Position: ${data.member.position}`);
        }
      } else {
        const errorData = await response.json();
        console.error('Add member error response:', errorData);
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Add member error:', err);
      alert('Failed to add member');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <span className="ml-3 text-lg text-gray-600">Loading team data...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <XCircle className="mx-auto text-red-600 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Team</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchTeamData}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No team data - Enhanced UI
  if (!teamData) {
    const isAdmin = user.role === 'admin';
    
    return (
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Users className="text-blue-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {isAdmin ? 'No Team Assigned' : 'Ready to Build Your Team?'}
          </h2>
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            {isAdmin 
              ? 'As an admin, you can manage all users through the Admin Panel. If you also manage a specific team, ask another admin to assign you to that team.'
              : 'You\'re set up as a manager, but you don\'t have a team assigned yet. Let\'s get you started with your first team!'
            }
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => setShowCreateTeam(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors shadow-lg"
            >
              <UserPlus size={20} />
              <span>Create Your First Team</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => window.location.href = '#admin'}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors shadow-lg"
              >
                <Users size={20} />
                <span>Go to Admin Panel</span>
              </button>
            )}
            <button
              onClick={fetchTeamData}
              className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-200 px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <Users size={20} />
              <span>Check Again</span>
            </button>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 text-blue-600" size={20} />
            Getting Started as a Manager
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Create Your Team</h4>
              <p className="text-sm text-gray-600">
                Set up your team structure and add your first team members
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Manage Leaves</h4>
              <p className="text-sm text-gray-600">
                Approve leave requests and track your team's vacation plans
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">View Analytics</h4>
              <p className="text-sm text-gray-600">
                Monitor team performance and leave patterns
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-yellow-600 text-sm">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Need Help?</h4>
              <p className="text-yellow-700 text-sm mb-3">
                If you believe you should have a team assigned, please contact your administrator 
                or check with HR to ensure your manager role is properly configured.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                  Contact Admin
                </span>
                <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                  Check with HR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Create Team Modal */}
        {showCreateTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Create Your Team</h3>
                  <button
                    onClick={() => setShowCreateTeam(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div>
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                      Team Name *
                    </label>
                    <input
                      id="teamName"
                      type="text"
                      name="teamName"
                      required
                      placeholder="e.g., Engineering Team, Marketing Team"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      id="teamDescription"
                      name="description"
                      rows={3}
                      placeholder="Brief description of your team's purpose..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> You'll be automatically added as the team manager and first member. 
                      You can add more team members after creating the team.
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateTeam(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Create Team
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 text-blue-600" size={32} />
              {teamData.teamName}
            </h2>
            <p className="text-gray-600 mt-1">Manager: {teamData.manager.name}</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
            Manager
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-2 sm:gap-8 px-3 sm:px-6 overflow-x-auto" aria-label="Team tabs">
            <button
              onClick={() => setActiveTab('members')}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === 'members'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Team Members</span>
                <span className="sm:hidden">Members</span>
                <span className="bg-gray-200 text-gray-700 px-1.5 sm:px-2 py-0.5 rounded-full text-xs">
                  {teamData.members.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === 'approvals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Leave Approvals</span>
                <span className="sm:hidden">Approvals</span>
                {pendingApprovalsCount > 0 ? (
                  <span className="bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium">
                    {pendingApprovalsCount}
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full text-xs">
                    0
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Key size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Pending Users</span>
                <span className="sm:hidden">Pending</span>
                {pendingUsers.length > 0 ? (
                  <span className="bg-orange-100 text-orange-700 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium">
                    {pendingUsers.length}
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full text-xs">
                    0
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <BarChart3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Team Analytics</span>
                <span className="sm:hidden">Analytics</span>
                <span className="bg-gray-200 text-gray-700 px-1.5 sm:px-2 py-0.5 rounded-full text-xs">
                  {statistics?.totalLeaves || 0}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'members' ? (
            <TeamMembersTab
              members={teamData.members}
              showAddMember={showAddMember}
              setShowAddMember={setShowAddMember}
              onRemoveMember={handleRemoveMember}
              onAddMember={handleAddMember}
            />
          ) : activeTab === 'approvals' ? (
            <LeaveApprovalPanel onApprovalChange={fetchPendingApprovalsCount} />
          ) : activeTab === 'pending' ? (
            <PendingUsersTab 
              pendingUsers={pendingUsers}
              onRefresh={fetchPendingUsers}
            />
          ) : (
            <TeamAnalyticsTab
              leaves={teamLeaves}
              members={teamData.members}
              statistics={statistics}
              teamData={teamData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Team Members Tab Component
function TeamMembersTab({ members, showAddMember, setShowAddMember, onRemoveMember, onAddMember }) {
  return (
    <div className="space-y-6">
      {/* Add Member Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">Team Members ({members.length})</h3>
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
        >
          <UserPlus size={18} />
          <span>Add Member</span>
        </button>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Team Member</h4>
          <form onSubmit={onAddMember} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="memberEmail"
                  type="email"
                  name="email"
                  required
                  placeholder="user@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="memberPosition" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Position
                </label>
                <div className="relative">
                  <select
                    id="memberPosition"
                    name="position"
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select job position</option>
                    <option value="Senior Developer">Senior Developer</option>
                    <option value="Junior Developer">Junior Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="UI Designer">UI Designer</option>
                    <option value="UX Designer">UX Designer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Business Analyst">Business Analyst</option>
                    <option value="Technical Writer">Technical Writer</option>
                    <option value="Intern">Intern</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Other">Other</option>
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex-1"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => (
          <MemberCard key={member._id || member.id} member={member} onRemove={onRemoveMember} />
        ))}
      </div>
    </div>
  );
}

// Member Card Component
function MemberCard({ member, onRemove }) {
  const [showRemove, setShowRemove] = useState(false);

  // Generate avatar initials from name
  const avatar = member.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div
      className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 relative"
      onMouseEnter={() => setShowRemove(true)}
      onMouseLeave={() => setShowRemove(false)}
    >
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {avatar}
        </div>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 truncate">{member.name}</h4>
            <div className="flex flex-col space-y-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <CheckCircle size={12} className="mr-1" />
                {member.role || 'Employee'}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {member.position || 'Employee'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{member.email}</p>
        </div>
      </div>

      {/* Remove Button (shows on hover) */}
      {showRemove && (
        <button
          onClick={() => onRemove(member._id)}
          className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
          title="Remove member"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

// Team Analytics Tab Component (includes calendar + analytics)
function TeamAnalyticsTab({ leaves, members, statistics, teamData }) {
  // Use real statistics from API or calculate if not provided
  const stats = statistics || {
    totalMembers: members.length,
    currentlyOnLeave: leaves.filter(l => l.status === 'current').length,
    availabilityPercent: 100,
    upcomingLeaves: leaves.filter(l => l.status === 'upcoming').length,
    totalLeaves: leaves.length
  };

  // eslint-disable-next-line no-unused-vars
  const upcomingLeaves = leaves.filter(l => l.status === 'upcoming');

  return (
    <div className="space-y-6">
      {/* Team Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="text-blue-600" size={24} />}
          title="Team Availability"
          value={`${stats.availabilityPercent}%`}
          subtitle={`${stats.totalMembers - stats.currentlyOnLeave}/${stats.totalMembers} available`}
          color="blue"
        />
        <StatCard
          icon={<XCircle className="text-yellow-600" size={24} />}
          title="Currently on Leave"
          value={stats.currentlyOnLeave}
          subtitle="team members"
          color="yellow"
        />
        <StatCard
          icon={<Calendar className="text-green-600" size={24} />}
          title="Upcoming Leaves"
          value={stats.upcomingLeaves}
          subtitle="in the future"
          color="green"
        />
      </div>

      {/* Team Calendar - Compact Version */}
      <TeamCalendarCompact teamLeaves={leaves} teamData={teamData} />

      {/* Leaves Table - Mobile Responsive */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="mr-2 text-gray-600" size={20} />
            Team Leave Schedule
          </h4>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave._id || leave.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs mr-3">
                        {leave.memberName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{leave.memberName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {leave.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {leave.days} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {leave.status === 'current' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        On Leave Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Upcoming
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {leaves.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No leave requests found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaves.map((leave) => (
                <div key={leave._id || leave.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {leave.memberName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {leave.memberName}
                        </h4>
                        {leave.status === 'current' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            On Leave Now
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium">📍</span>
                          <span className="ml-2 truncate">{leave.destination}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">📅</span>
                          <span className="ml-2">
                            {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">⏱️</span>
                          <span className="ml-2">{leave.days} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact Team Calendar Component (same size as dashboard calendar)
function TeamCalendarCompact({ teamLeaves, teamData }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  console.log('TeamCalendarCompact received:', {
    teamLeaves: teamLeaves?.length || 0,
    leaves: teamLeaves?.map(l => ({
      id: l.id,
      memberName: l.memberName,
      fromDate: l.fromDate,
      toDate: l.toDate,
      leaveType: l.leaveType
    }))
  });

  // Get current month and year
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Get days in current month
  const firstDay = new Date(year, currentDate.getMonth(), 1);
  const lastDay = new Date(year, currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, currentDate.getMonth(), day);
    
    // Find leaves for this date
    const dayLeaves = teamLeaves?.filter(leave => {
      const startDate = new Date(leave.fromDate);
      const endDate = new Date(leave.toDate);
      return date >= startDate && date <= endDate;
    }) || [];

    calendarDays.push({
      day,
      date,
      leaves: dayLeaves
    });
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="mr-2 text-blue-600" size={20} />
          <span className="hidden sm:inline">Team Leave Calendar - </span>
          <span className="sm:hidden">Calendar - </span>
          {month} {year}
        </h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid - Mobile Responsive */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="p-1 sm:p-2 text-center text-xs font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days - Mobile Responsive */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[50px] sm:min-h-[60px] border-r border-b border-gray-200 p-0.5 sm:p-1 ${
                day === null ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <div className="text-xs font-medium text-gray-900 mb-1">
                    {day.day}
                  </div>
                  <div className="space-y-0.5">
                    {day.leaves.slice(0, 1).map((leave, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-0.5 sm:p-1 rounded bg-blue-100 text-blue-800 truncate"
                        title={`${leave.memberName}: ${leave.type}`}
                      >
                        <span className="hidden sm:inline">{leave.memberName.split(' ')[0]}</span>
                        <span className="sm:hidden">{leave.memberName.split(' ')[0].charAt(0)}</span>
                      </div>
                    ))}
                    {day.leaves.length > 1 && (
                      <div className="text-xs text-gray-500">
                        +{day.leaves.length - 1}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend - Compact */}
      <div className="flex items-center space-x-4 text-xs text-gray-600 mt-3">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-100 rounded"></div>
          <span>On Leave</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-100 rounded border"></div>
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg border p-4`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

// Pending Users Tab Component
function PendingUsersTab({ pendingUsers, onRefresh }) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : 'https://leave-tracking-backend.onrender.com');

  const token = localStorage.getItem('token');

  const clearTempPassword = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/clear-temp-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('✅ Temporary password cleared successfully!');
        onRefresh(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Clear temp password error:', err);
      alert('❌ Failed to clear temporary password');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy to clipboard');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Pending Users ({pendingUsers.length})
        </h3>
        <button
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Calendar size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-xl text-center">
          <CheckCircle className="mx-auto mb-4" size={48} />
          <p className="text-lg font-semibold">No pending users!</p>
          <p className="text-sm mt-2">All users have completed their account setup.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingUsers.map(user => (
            <div key={user._id} className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-lg font-semibold text-gray-800">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-orange-600 font-medium">
                    Created: {new Date(user.tempPasswordCreatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-800">Temporary Password:</span>
                  <button
                    onClick={() => copyToClipboard(user.tempPassword)}
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="bg-white border border-orange-300 rounded px-3 py-2 font-mono text-sm">
                  {user.tempPassword}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>Role: <span className="font-medium">{user.role}</span></span>
                <span>Team: <span className="font-medium">{user.team?.name || 'Unassigned'}</span></span>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const message = `Welcome to the team! Here are your login credentials:\n\nEmail: ${user.email}\nPassword: ${user.tempPassword}\n\nPlease login and change your password.\n\nLogin URL: ${window.location.origin}`;
                    copyToClipboard(message);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  📧 Copy Login Info
                </button>
                <button
                  onClick={() => clearTempPassword(user._id)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  ✅ Mark Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Instructions for New Users:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Share the login credentials with the new user</li>
          <li>2. Ask them to login and change their password</li>
          <li>3. Click "Mark Complete" once they've logged in</li>
          <li>4. Temporary passwords expire after 7 days</li>
        </ol>
      </div>
    </div>
  );
}

export default MyTeam;


