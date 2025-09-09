import { TestBed } from '@angular/core/testing';
import { EventService } from './event.service';
import { CalendarEvent } from '../models/constants';

describe('EventService', () => {
  let service: EventService;
  let mockStorage: { [key: string]: string };

  const sampleEvent: CalendarEvent = {
    id: '1',
    title: 'Meeting',
    date: '2025-09-09',
    category: 'Work',
    color: 'Blue',
    description: 'Sample event'
  };

  beforeEach(() => {
    // Mock localStorage
    mockStorage = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string): string | null => {
      return mockStorage[key] || null;
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): void => {
      mockStorage[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
      delete mockStorage[key];
    });

    TestBed.configureTestingModule({
      providers: [EventService],
    });
    service = TestBed.inject(EventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty events when no localStorage data', () => {
    expect(service.events).toEqual([]);
  });

  it('should load events from localStorage if available', () => {
    mockStorage['calendar_events'] = JSON.stringify([sampleEvent]);
    const newService = new EventService();
    expect(newService.events.length).toBe(1);
    expect(newService.events[0].title).toBe('Meeting');
  });

  it('should add an event and persist to localStorage', () => {
    service.addEvent(sampleEvent);
    expect(service.events.length).toBe(1);
    expect(service.events[0]).toEqual(sampleEvent);
    expect(localStorage.setItem).toHaveBeenCalledWith('calendar_events', JSON.stringify([sampleEvent]));
  });

  it('should update an existing event', () => {
    service.addEvent(sampleEvent);
    const updated: CalendarEvent = { ...sampleEvent, title: 'Updated Meeting' };
    service.updateEvent(updated);
    expect(service.events[0].title).toBe('Updated Meeting');
  });

  it('should delete an event by id', () => {
    service.addEvent(sampleEvent);
    service.deleteEvent(sampleEvent.id);
    expect(service.events.length).toBe(0);
  });

  it('should return events by date', () => {
    service.addEvent(sampleEvent);
    const events = service.getEventsByDate('2025-09-09');
    expect(events.length).toBe(1);
    expect(events[0].id).toBe('1');
  });

  it('should return empty array if no events match date', () => {
    service.addEvent(sampleEvent);
    const events = service.getEventsByDate('2025-01-01');
    expect(events.length).toBe(0);
  });

  it('should emit new values to subscribers when events are updated', (done) => {
    service.events$.subscribe(events => {
      if (events.length > 0) {
        expect(events[0].title).toBe('Meeting');
        done();
      }
    });
    service.addEvent(sampleEvent);
  });
});
