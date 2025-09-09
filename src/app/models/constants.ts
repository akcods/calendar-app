export const DAYS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export interface CalendarGrid {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}