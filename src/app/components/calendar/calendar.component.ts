import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarEvent, CalendarGrid, DAYS } from '../../models/constants';
import { EventService } from '../../services/event.service';
import { EventModalComponent } from "../event-modal/event-modal.component";

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, EventModalComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {

  currentDate = new Date();
  weeks: CalendarGrid[][] = [];
  Days: string[] = DAYS;
  selectedDate: string | null = null;
  
  modalEvents: CalendarEvent[] = [];
  showModal = false;

  constructor(private eventService: EventService) { }

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

      const formattedDate = this.getFormattedDate(date);
      const events: CalendarEvent[] = this.eventService.getEventsByDate(formattedDate);

    return {
      date,
      isCurrentMonth,
      isToday,
      events
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
    this.selectedDate = this.getFormattedDate(date);
    this.modalEvents = this.eventService.getEventsByDate(this.selectedDate);
    this.showModal = true;
  }

  onModalClose() {
    this.showModal = false;
  }

  onEventSave(event: CalendarEvent) {
    this.eventService.addEvent(event);
    this.onModalClose();
    this.generateCalendar(); // Refresh view
  }

  onEventDelete(id: string) {
    this.eventService.deleteEvent(id);
    this.modalEvents = this.modalEvents.filter(e => e.id !== id);
    this.generateCalendar();
  }

  private getFormattedDate(date: Date) {
    const DatePadStartLength = 2;
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(DatePadStartLength, '0')}-${date.getDate().toString().padStart(DatePadStartLength, '0')}`;
  }
}
