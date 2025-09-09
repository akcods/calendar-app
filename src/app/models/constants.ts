export const DAYS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export interface CalendarGrid {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // format: 'YYYY-MM-DD'
  category: EventCategory;
  color: EventCategoryColor;
}

export const EVENT_CATEGORIES = {
  Work: '#2196f3',
  Personal: '#4caf50',
  Important: '#f44336',
} as const;

export type EventCategory = keyof typeof EVENT_CATEGORIES;
export type EventCategoryColor = typeof EVENT_CATEGORIES[EventCategory];

// Generate the categories array dynamically
export const Categories = Object.entries(EVENT_CATEGORIES).map(([name, color]) => ({
  name: name as EventCategory,
  color: color as EventCategoryColor,
}));