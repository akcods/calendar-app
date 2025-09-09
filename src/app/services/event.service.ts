import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CalendarEvent } from '../models/constants';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly _localStorage = localStorage;
  private readonly eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  private readonly localStorageKey : string = 'calendar_events';

  events$ = this.eventsSubject.asObservable();

  constructor() {
    const stored = this._localStorage.getItem(this.localStorageKey);
    if (stored) {
      this.eventsSubject.next(JSON.parse(stored));
    }
  }

  get events(): CalendarEvent[] {
    return this.eventsSubject.getValue();
  }

  private update(events: CalendarEvent[]) {
    this.eventsSubject.next(events);
    this._localStorage.setItem(this.localStorageKey, JSON.stringify(events));
  }

  addEvent(event: CalendarEvent) {
    this.update([...this.events, event]);
  }

  updateEvent(updated: CalendarEvent) {
    const events = this.events.map(e => e.id === updated.id ? updated : e);
    this.update(events);
  }

  deleteEvent(id: string) {
    const events = this.events.filter(e => e.id !== id);
    this.update(events);
  }

  getEventsByDate(date: string): CalendarEvent[] {
    return this.events.filter(e => e.date === date);
  }
}