import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Clock, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const LeaveApprovalPanel = ({ onApprovalChange }) => {
  const { token } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingLeaves = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/leaves/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingLeaves(data);
      } else if (response.status === 403) {
        setError('Manager access required to view pending leaves');
      } else {
        setError('Failed to fetch pending leaves');
      }
    } catch (err) {
      console.error('Fetch pending leaves error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingLeaves();
  }, [fetchPendingLeaves]);

  const handleApprove = async (leaveId) => {
    if (!token) return;

    try {
      setProcessingId(leaveId);

      const response = await fetch(`${API_BASE_URL}/api/leaves/${leaveId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Approved by manager' })
      });

      if (response.ok) {
        // Remove from pending list
        setPendingLeaves(prev => prev.filter(leave => leave._id !== leaveId));
        
        // Update parent component's pending count
        if (onApprovalChange) {
          onApprovalChange();
        }
        
        // Show success message
        alert('Leave request approved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Approve leave error:', err);
      alert('Failed to approve leave request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (leaveId) => {
    if (!token) return;

    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim().length === 0) {
      alert('Rejection reason is required.');
      return;
    }

    try {
      setProcessingId(leaveId);

      const response = await fetch(`${API_BASE_URL}/api/leaves/${leaveId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason.trim() })
      });

      if (response.ok) {
        // Remove from pending list
        setPendingLeaves(prev => prev.filter(leave => leave._id !== leaveId));
        
        // Update parent component's pending count
        if (onApprovalChange) {
          onApprovalChange();
        }
        
        // Show success message
        alert('Leave request rejected successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Reject leave error:', err);
      alert('Failed to reject leave request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLeaveTypeColor = (leaveType) => {
    switch (leaveType) {
      case 'EL':
        return 'bg-green-100 text-green-800';
      case 'SL':
        return 'bg-blue-100 text-blue-800';
      case 'CL':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeLabel = (leaveType) => {
    switch (leaveType) {
      case 'EL':
        return 'Earned Leave';
      case 'SL':
        return 'Sick Leave';
      case 'CL':
        return 'Casual Leave';
      default:
        return leaveType;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading pending leaves...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8 text-center">
          <div>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Leaves</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchPendingLeaves}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Leave Approvals</h2>
            <p className="text-gray-600 mt-1">
              {pendingLeaves.length === 0 
                ? 'No pending leave requests' 
                : `${pendingLeaves.length} pending leave request${pendingLeaves.length === 1 ? '' : 's'}`
              }
            </p>
          </div>
          <button
            onClick={fetchPendingLeaves}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Pending Leaves */}
      {pendingLeaves.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No pending leave requests to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingLeaves.map((leave) => (
            <div
              key={leave._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Employee Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {leave.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{leave.user.name}</h3>
                      <p className="text-sm text-gray-500">{leave.user.email}</p>
                    </div>
                  </div>

                  {/* Leave Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <strong>Dates:</strong> {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <strong>Duration:</strong> {leave.days} day{leave.days === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                        {getLeaveTypeLabel(leave.leaveType)}
                      </span>
                    </div>

                    {leave.destination && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          <strong>Destination:</strong> {leave.destination}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submission Time */}
                  <div className="text-xs text-gray-500 mb-4">
                    Submitted on {new Date(leave.submittedAt).toLocaleString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => handleApprove(leave._id)}
                    disabled={processingId === leave._id}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => handleReject(leave._id)}
                    disabled={processingId === leave._id}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveApprovalPanel;
