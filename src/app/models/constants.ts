export const DAYS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export interface CalendarGrid {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // format: 'YYYY-MM-DD'
  category: EventCategory;
  color: EventCategoryColor;
}

type EventCategory = 'Work' | 'Personal' | 'Important';
type EventCategoryColor = 'Blue' | 'Green' | 'Red';