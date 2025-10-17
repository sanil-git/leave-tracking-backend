import React from 'react';
import { useTranslation } from 'react-i18next';
import VacationForm from '../VacationForm';
import OptimizedIcon from '../ui/OptimizedIcon';

/**
 * LeaveForm - Self-contained vacation/leave form component
 * Handles vacation submission and leave balance management
 */
const LeaveForm = ({ 
  leaveBalances, 
  existingVacations, 
  holidays, 
  onAddVacation 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6" data-vacation-planner>
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
          <OptimizedIcon name="beach" size={20} color="#9333ea" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('vacation.planYourVacation')}</h2>
          <p className="text-sm text-gray-600">{t('vacation.planDescription')}</p>
        </div>
      </div>
      
      <VacationForm
        leaveBalances={leaveBalances}
        existingVacations={existingVacations}
        holidays={holidays}
        onAddVacation={onAddVacation}
      />
    </div>
  );
};

export default LeaveForm;
