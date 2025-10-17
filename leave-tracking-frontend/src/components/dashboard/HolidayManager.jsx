import React from 'react';
import { useTranslation } from 'react-i18next';
import HolidayManagement from '../HolidayManagement';
import NationalHolidays from '../NationalHolidays';
import OptimizedIcon from '../ui/OptimizedIcon';

/**
 * HolidayManager - Self-contained holiday management component
 * Handles adding, deleting, and viewing holidays
 */
const HolidayManager = ({ 
  holidays, 
  onAddHoliday, 
  onDeleteHoliday, 
  API_BASE_URL, 
  token, 
  isLoading 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
            <OptimizedIcon name="party" size={20} color="#ea580c" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('holiday.management')}</h2>
            <p className="text-sm text-gray-600">{t('holiday.manageDescription')}</p>
          </div>
        </div>
        
        {/* Official Indian Holidays Tab - Moved here to save space */}
        <NationalHolidays 
          onAddHoliday={onAddHoliday}
          API_BASE_URL={API_BASE_URL}
          token={token}
          existingHolidays={holidays}
        />
      </div>
      
      <HolidayManagement
        holidays={holidays}
        API_BASE_URL={API_BASE_URL}
        token={token}
        onAddHoliday={onAddHoliday}
        onDeleteHoliday={onDeleteHoliday}
        isLoading={isLoading}
      />
    </div>
  );
};

export default HolidayManager;
