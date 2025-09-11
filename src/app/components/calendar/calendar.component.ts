import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarEvent, CalendarGrid, DAYS, ModalMode } from '../../models/constants';
import { EventService } from '../../services/event.service';
import { EventModalComponent } from "../event-modal/event-modal.component";
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, EventModalComponent, DragDropModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {

  currentDate = new Date();
  weeks: CalendarGrid[][] = [];
  Days: string[] = DAYS;
  selectedDate: string | null = null;

  modalEvents: CalendarEvent[] = [];
  modalMode: ModalMode = ModalMode.Create;
  showModal = false;
  selectedEvent: CalendarEvent | undefined = undefined;
  searchResults: CalendarEvent[] = [];

  private searchQuerySubject: Subject<string> = new Subject<string>();

  constructor(public eventService: EventService) {
    this.searchQuerySubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(searchValue => {
      if (searchValue.trim().length > 0) {
        this.searchResults = this.filterEvents(searchValue);
      } else {
        this.searchResults = [];
      }
    });
  }

  ngOnInit() {
    this.generateCalendar();
  }

  getDropListId(date: Date): string {
    return this.getFormattedDate(date);
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
    this.modalMode = ModalMode.Create;
    this.showModal = true;
  }

  onSearch(event: Event) {
    const searchQuery = (event.target as HTMLInputElement).value;
    this.searchQuerySubject.next(searchQuery);
  }

  onModalClose() {
    this.showModal = false;
  }

  onEventSave(event: CalendarEvent) {
    this.eventService.addEvent(event);
    this.onModalClose();
    this.generateCalendar();
  }

  onEventUpdate(event: CalendarEvent) {
    this.eventService.updateEvent(event);
    this.onModalClose();
    this.generateCalendar();
  }

  onEventDelete(id: string) {
    this.eventService.deleteEvent(id);
    this.modalEvents = this.modalEvents.filter(e => e.id !== id);
    this.showModal = false;
    this.generateCalendar();
  }

  onEventClick(event: CalendarEvent) {
    this.selectedDate = event.date;
    this.selectedEvent = event;
    this.modalEvents = [event];
    this.modalMode = ModalMode.View;
    this.showModal = true;
  }

  onMoreEventsClick(date: Date) {
    this.selectedDate = this.getFormattedDate(date);
    this.modalEvents = this.eventService.getEventsByDate(this.selectedDate);
    this.selectedEvent = undefined;
    this.modalMode = ModalMode.List;
    this.showModal = true;
  }

  onEventDrop(event: CdkDragDrop<CalendarEvent[]>) {
    const eventData: CalendarEvent = event.item.data;
    const targetElement = (event.event.target as HTMLElement).closest('.day-cell') as HTMLElement;
    const targetDate = targetElement?.getAttribute('data-date');

    if (!targetDate) return;

    const updatedEvent = { ...eventData };
    updatedEvent.date = targetDate.toString();
    this.eventService.updateEvent(updatedEvent);
    this.generateCalendar();
  }

  private filterEvents = (query: string): CalendarEvent[] => {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return this.eventService.events.filter(e =>
      e.title.toLowerCase().includes(lowerQuery) ||
      e.description?.toLowerCase().includes(lowerQuery) ||
      e.category.toLowerCase().includes(lowerQuery)
    );
  };

  private getFormattedDate(date: Date) {
    const DatePadStartLength = 2;
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(DatePadStartLength, '0')}-${date.getDate().toString().padStart(DatePadStartLength, '0')}`;
  }
}
