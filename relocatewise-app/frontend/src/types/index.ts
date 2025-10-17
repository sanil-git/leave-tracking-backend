// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currentLocation?: {
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  destinationCity?: {
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  moveDate?: string;
  travelMode: boolean;
  preferences?: {
    currency: string;
    language: string;
    timezone: string;
  };
}

// Checklist Types
export interface ChecklistItem {
  _id?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags?: string[];
  notes?: string;
  completedAt?: string;
}

export interface Checklist {
  _id: string;
  user: string;
  title: string;
  description?: string;
  category: 'housing' | 'documents' | 'packing' | 'utilities' | 'local_setup' | 'transportation' | 'finances' | 'healthcare' | 'education' | 'other';
  phase: 'pre_move' | 'move_day' | 'post_move';
  destinationCity: string;
  destinationCountry: string;
  isTemplate: boolean;
  templateName?: string;
  items: ChecklistItem[];
  isActive: boolean;
  completedAt?: string;
  completionPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

// Photo Types
export interface Photo {
  _id: string;
  user: string;
  checklist?: string;
  checklistItem?: string;
  title: string;
  description?: string;
  cloudinaryId: string;
  url: string;
  thumbnailUrl?: string;
  category: 'apartment_visit' | 'receipt' | 'id_document' | 'contract' | 'utility_bill' | 'moving_box' | 'before_after' | 'other';
  tags?: string[];
  location?: {
    city?: string;
    country?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  takenAt: string;
  fileSize: number;
  dimensions?: {
    width: number;
    height: number;
  };
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

// Journal Types
export interface JournalEntry {
  _id: string;
  user: string;
  title: string;
  content: string;
  location?: {
    city?: string;
    country?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  mood: 'excited' | 'nervous' | 'stressed' | 'happy' | 'sad' | 'neutral' | 'overwhelmed' | 'confident';
  tags: string[];
  photos?: Photo[];
  isPrivate: boolean;
  wordCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

// Suggestion Types
export interface Suggestion {
  _id: string;
  city: string;
  country: string;
  category: 'housing' | 'documents' | 'packing' | 'utilities' | 'local_setup' | 'transportation' | 'finances' | 'healthcare' | 'education' | 'culture' | 'language' | 'weather' | 'safety';
  phase: 'pre_move' | 'move_day' | 'post_move';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime?: string;
  cost?: string;
  requirements?: string[];
  tips?: string[];
  resources?: {
    name: string;
    url: string;
    type: 'website' | 'document' | 'app' | 'service' | 'contact';
  }[];
  applicableFor?: ('citizen' | 'expat' | 'student' | 'worker' | 'tourist' | 'all')[];
  isActive: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Timeline Types
export interface TimelinePhase {
  pre_move: Checklist[];
  move_day: Checklist[];
  post_move: Checklist[];
}

export interface TimelineStats {
  totalChecklists: number;
  totalItems: number;
  completedItems: number;
  overallProgress: number;
}

export interface TimelineData {
  timeline: TimelinePhase;
  stats: TimelineStats;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEntries: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileForm {
  name: string;
  currentLocation: {
    city: string;
    country: string;
  };
  destinationCity: {
    city: string;
    country: string;
  };
  moveDate: string;
  travelMode: boolean;
}
