import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarGrid, DAYS } from '../../models/constants';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {

  currentDate = new Date();
  weeks: CalendarGrid[][] = [];
  Days: string[] = DAYS;
  selectedDate: string | null = null;

  constructor() { }

  ngOnInit() {
    this.generateCalendar();
  }

  private generateCalendar() {
    const startOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    const startDayOfWeek = startOfMonth.getDay(); // 0 = Sunday, 6 = Saturday
    const totalDaysInMonth = endOfMonth.getDate();

    const calendarDays: CalendarGrid[] = [];

    // Days from previous month
    const prevMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, prevMonthDays - i);
      calendarDays.push(this.createCalendarDay(date, false));
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
      calendarDays.push(this.createCalendarDay(date, true));
    }

    // Next month days to complete grid
    const totalCells = Math.ceil(calendarDays.length / 7) * 7;
    const remaining = totalCells - calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, i);
      calendarDays.push(this.createCalendarDay(date, false));
    }

    // Split into 5 or 6 weeks
    this.weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      this.weeks.push(calendarDays.slice(i, i + 7));
    }
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarGrid {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    return {
      date,
      isCurrentMonth,
      isToday,
    };
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  navigateToToday() {
    this.currentDate = new Date();
    this.generateCalendar();
  }

  onDateClick(date: Date) {
    console.log('Date grid clicked', date);
  }
}
