import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomCalendar from '../CustomCalendar';
import OptimizedIcon from '../ui/OptimizedIcon';

/**
 * Calendar - Self-contained calendar component
 * Displays holidays, vacations, and handles navigation
 */
const Calendar = ({ 
  holidays, 
  vacations, 
  currentDate, 
  onNavigate, 
  onViewChange, 
  isLoading 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 border-b border-purple-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3">
            <OptimizedIcon name="calendar-icon" size={20} color="#7c3aed" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('calendar.title')}</h2>
            <p className="text-sm text-gray-600">{t('calendar.description')}</p>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <CustomCalendar
          holidays={holidays}
          vacations={vacations}
          onNavigate={onNavigate}
          currentDate={currentDate}
          onViewChange={onViewChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Calendar;
