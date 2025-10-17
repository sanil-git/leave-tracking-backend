import React, { useState, useEffect } from 'react';
import { Shield, Users, Crown, User, Search, Filter, Check, X, AlertTriangle, UserPlus } from 'lucide-react';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://leave-tracking-backend.onrender.com');

// Role Badge Component (currently unused)
// eslint-disable-next-line no-unused-vars
function RoleBadge({ role }) {
  const roleConfig = {
    employee: { 
      label: 'Employee', 
      color: 'bg-green-100 text-green-800',
      icon: <User size={12} />
    },
    manager: { 
      label: 'Manager', 
      color: 'bg-blue-100 text-blue-800',
      icon: <Crown size={12} />
    },
    admin: { 
      label: 'Admin', 
      color: 'bg-purple-100 text-purple-800',
      icon: <Shield size={12} />
    }
  };

  const config = roleConfig[role] || roleConfig.employee;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </span>
  );
}

// Role Selector Component
function RoleSelector({ currentRole, userId, onRoleChange, allowedRoles }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleRoleChange = (newRole) => {
    if (newRole !== currentRole) {
      onRoleChange(userId, newRole);
    }
    setIsOpen(false);
  };

  const roleConfig = {
    employee: { 
      label: 'Employee', 
      color: 'bg-green-100 text-green-800',
      icon: <User size={12} />
    },
    manager: { 
      label: 'Manager', 
      color: 'bg-blue-100 text-blue-800',
      icon: <Crown size={12} />
    },
    admin: { 
      label: 'Admin', 
      color: 'bg-purple-100 text-purple-800',
      icon: <Shield size={12} />
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Click to change role"
      >
        {roleConfig[currentRole].icon}
        <span className="ml-1">{roleConfig[currentRole].label}</span>
        <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
              Change Role
            </div>
            {allowedRoles.map(role => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                disabled={role === currentRole}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center ${
                  role === currentRole ? 'bg-gray-50 cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                {roleConfig[role].icon}
                <span className="ml-2">{roleConfig[role].label}</span>
                {role === currentRole && <Check size={12} className="ml-auto text-green-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// User Card Component
function UserCard({ user, onRoleChange }) {
  const allowedRoles = ['employee', 'manager', 'admin'];
  
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <RoleSelector 
            currentRole={user.role}
            userId={user._id}
            onRoleChange={(newRole) => onRoleChange(user._id, newRole)}
            allowedRoles={allowedRoles}
          />
        </div>
      </div>
    </div>
  );
}

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch all users
  useEffect(() => {
    fetchAllUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    // Find the user to get their name
    const user = users.find(u => u._id === userId);
    const userName = user ? user.name : 'User';
    
    // Get reason from user
    const reason = prompt(`Why are you changing ${userName}'s role to "${newRole}"?`);
    if (reason === null) return; // User cancelled

    try {
      // API call to update role
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          role: newRole,
          reason: reason || 'No reason provided'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
        
        // Show success message with details
        alert(`✅ Role updated successfully!\n\nUser: ${data.user.name}\nChanged from: ${data.change.from}\nChanged to: ${data.change.to}\nReason: ${data.change.reason}`);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Update role error:', err);
      alert('❌ Failed to update role. Please try again.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const role = formData.get('role');
    const password = formData.get('password');

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: role || 'employee'
        })
      });

      if (response.ok) {
        const newUser = await response.json();
        setShowCreateUser(false);
        fetchAllUsers(); // Refresh users list
        alert(`✅ User created successfully!\n\n👤 Name: ${newUser.user.name}\n📧 Email: ${newUser.user.email}\n🏷️ Role: ${newUser.user.role}`);
        e.target.reset(); // Clear form
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Create user error:', err);
      alert('❌ Failed to create user. Please try again.');
    }
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-gray-600 mt-1">Manage users, roles, and system settings</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">Total Users</div>
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <label htmlFor="user-search" className="sr-only">
              Search users by name or email
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="user-search"
              name="user-search"
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="text-gray-400" size={20} />
            <label htmlFor="role-filter" className="sr-only">
              Filter by role
            </label>
            <select
              id="role-filter"
              name="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <button 
            onClick={() => setSearchTerm('')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Users className="text-gray-400 mr-2" size={20} />
            <span className="text-sm font-medium text-gray-600">Show All Users</span>
          </button>
          <button 
            onClick={() => setRoleFilter('admin')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <Shield className="text-gray-400 mr-2" size={20} />
            <span className="text-sm font-medium text-gray-600">Show Admins Only</span>
          </button>
          <button 
            onClick={() => setRoleFilter('manager')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Crown className="text-gray-400 mr-2" size={20} />
            <span className="text-sm font-medium text-gray-600">Show Managers</span>
          </button>
          <button 
            onClick={() => setRoleFilter('employee')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <User className="text-gray-400 mr-2" size={20} />
            <span className="text-sm font-medium text-gray-600">Show Employees</span>
          </button>
          <button 
            onClick={() => setShowCreateUser(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
          >
            <UserPlus className="text-gray-400 mr-2" size={20} />
            <span className="text-sm font-medium text-gray-600">Create New User</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchAllUsers}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <UserCard 
                key={user._id} 
                user={user} 
                onRoleChange={(newRole) => handleRoleChange(user._id, newRole)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || roleFilter 
                ? 'Try adjusting your search criteria or filters.' 
                : 'No users are currently registered in the system.'}
            </p>
            <button 
              onClick={() => setShowCreateUser(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First User
            </button>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                <button 
                  onClick={() => setShowCreateUser(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="adminName"
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  name="email"
                  required
                  placeholder="john.doe@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="adminRole" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="adminRole"
                  name="role"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="adminPassword"
                  type="password"
                  name="password"
                  required
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;