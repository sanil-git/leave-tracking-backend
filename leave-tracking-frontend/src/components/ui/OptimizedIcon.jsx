import React from 'react';
import { 
  Calendar, 
  Plane, 
  PartyPopper,
  MapPin,
  Clock,
  TrendingUp,
  Bell,
  Users,
  CheckCircle,
  Star
} from 'lucide-react';

/**
 * OptimizedIcon - Centralized icon component using Lucide React
 * Replaces emoji icons with optimized SVG alternatives
 */
const OptimizedIcon = ({ 
  name, 
  size = 20, 
  className = '', 
  color,
  ...props 
}) => {
  const iconMap = {
    // Dashboard icons
    calendar: Calendar,
    vacation: Plane,
    holiday: PartyPopper,
    location: MapPin,
    time: Clock,
    trending: TrendingUp,
    notification: Bell,
    team: Users,
    success: CheckCircle,
    star: Star,
    
    // Custom emoji replacements
    'beach': () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <path 
          fill={color || "currentColor"} 
          d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1L13.5 2.5L16.17 5.17L10.5 10.84L15.17 15.51L21 9.68V9M7.5 12L10 14.5L8.5 16L6 13.5L7.5 12M2.81 15.78L5.93 18.9L4.52 20.31L1.39 17.19L2.81 15.78M8.5 18L11 20.5L9.5 22L7 19.5L8.5 18M13 19C11.9 19 11 19.9 11 21C11 22.1 11.9 23 13 23C14.1 23 15 22.1 15 21C15 19.9 14.1 19 13 19Z"
        />
      </svg>
    ),
    
    'party': () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <path 
          fill={color || "currentColor"} 
          d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6L14,10L18,10L15,13L16,17L12,15L8,17L9,13L6,10L10,10L12,6Z"
        />
      </svg>
    ),
    
    'calendar-icon': () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <path 
          fill={color || "currentColor"} 
          d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"
        />
      </svg>
    )
  };

  // Get the icon component
  const IconComponent = iconMap[name] || iconMap[name.toLowerCase()];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in OptimizedIcon component`);
    return <span className={className} {...props}>?</span>;
  }
  
  // Handle function components (custom SVGs)
  if (typeof IconComponent === 'function' && !IconComponent.$$typeof) {
    return <IconComponent />;
  }
  
  // Handle Lucide React components
  return (
    <IconComponent 
      size={size} 
      className={className} 
      color={color}
      {...props} 
    />
  );
};

export default OptimizedIcon;
