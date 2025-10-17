import React, { useState, useCallback } from 'react';
import { X, UserPlus, Mail, User, CheckCircle } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';

const AddMemberModal = React.memo(() => {
  const { toggleModal, addTeamMember, loading } = useTeam();
  const [formData, setFormData] = useState({
    email: '',
    role: 'employee'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear success state when user modifies form
    if (success) {
      setSuccess(false);
    }
  }, [errors, success]);

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    return newErrors;
  }, [formData, validateEmail]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const result = await addTeamMember(formData.email.trim());
      
      if (result.success) {
        setSuccess(true);
        // Reset form
        setFormData({ email: '', role: 'employee' });
        
        // Auto close after 2 seconds
        setTimeout(() => {
          toggleModal('addMember');
          setSuccess(false);
        }, 2000);
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, addTeamMember, toggleModal]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      toggleModal('addMember');
      // Reset form on close
      setFormData({ email: '', role: 'employee' });
      setErrors({});
      setSuccess(false);
    }
  }, [isSubmitting, toggleModal]);

  const handleAddAnother = useCallback(() => {
    setFormData({ email: '', role: 'employee' });
    setErrors({});
    setSuccess(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${success ? 'bg-green-100' : 'bg-blue-100'}`}>
              {success ? (
                <CheckCircle className="text-green-600" size={24} />
              ) : (
                <UserPlus className="text-blue-600" size={24} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {success ? 'Member Added!' : 'Add Team Member'}
              </h2>
              <p className="text-sm text-gray-600">
                {success ? 'Successfully added to your team' : 'Invite someone to join your team'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-6 text-center">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Team Member Added Successfully!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {formData.email} has been added to your team and will receive a notification.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleAddAnother}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Another
              </button>
              
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="colleague@company.com"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors appearance-none ${
                      errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Role determines what permissions they'll have in the team
                </p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">How it works</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• We'll send them an invitation email</li>
                      <li>• They can access the team immediately</li>
                      <li>• You can manage their permissions anytime</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !formData.email.trim() || loading.any}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Add Member</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

AddMemberModal.displayName = 'AddMemberModal';

export default AddMemberModal;
