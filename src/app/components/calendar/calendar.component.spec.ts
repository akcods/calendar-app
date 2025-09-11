import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { By } from '@angular/platform-browser';
import { CalendarEvent, DAYS, ModalMode } from '../../models/constants';
import { EventService } from '../../services/event.service';
import { EventModalComponent } from '../event-modal/event-modal.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { of } from 'rxjs';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;

  const formattedDate = '2025-09-10';
  const sampleEvent: CalendarEvent = {
    id: '1',
    title: 'Test Event',
    description: 'desc',
    date: formattedDate,
    category: 'Work',
    color: '#2196f3',
  };

  beforeEach(async () => {
    const Spy = jasmine.createSpyObj('EventService', ['getEventsByDate', 'addEvent', 'deleteEvent', 'updateEvent'], {
      events$: of([sampleEvent])
    });

    await TestBed.configureTestingModule({
      imports: [CalendarComponent, EventModalComponent],
      providers: [{ provide: EventService, useValue: Spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    eventServiceSpy = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;

    eventServiceSpy.getEventsByDate.and.returnValue([sampleEvent]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render day headers', () => {
    const dayHeaders = fixture.debugElement.queryAll(By.css('.day-name'));
    expect(dayHeaders.length).toBe(DAYS.length);
    expect(dayHeaders[0].nativeElement.textContent.trim()).toBe(DAYS[0]);
  });

  it('should show current month label', () => {
    const label = fixture.debugElement.query(By.css('.month-label')).nativeElement;
    const expected = component.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    expect(label.textContent.trim()).toBe(expected);
  });


  it('should go to previous month when prev button is clicked', () => {
    const currentMonth = component.currentDate.getMonth();
    const prevButton = fixture.debugElement.query(By.css('.arrow:first-child')).nativeElement;
    prevButton.click();
    fixture.detectChanges();
    expect(component.currentDate.getMonth()).toBe(currentMonth - 1 < 0 ? 11 : currentMonth - 1);
  });

  it('should go to next month when next button is clicked', () => {
    const currentMonth = component.currentDate.getMonth();
    const nextButton = fixture.debugElement.queryAll(By.css('.arrow'))[1].nativeElement;
    nextButton.click();
    fixture.detectChanges();
    expect(component.currentDate.getMonth()).toBe((currentMonth + 1) % 12);
  });

  it('should navigate to today when Today button is clicked', () => {
    component.currentDate = new Date(2000, 0, 1); // set to old date
    fixture.detectChanges();
    const todayButton = fixture.debugElement.query(By.css('.today-btn')).nativeElement;
    todayButton.click();
    fixture.detectChanges();
    const today = new Date();
    expect(component.currentDate.getFullYear()).toBe(today.getFullYear());
    expect(component.currentDate.getMonth()).toBe(today.getMonth());
  });

  it('should render 5 or 6 weeks in the grid', () => {
    const weeksCount = component.weeks.length;
    expect([5, 6]).toContain(weeksCount);
  });

  it('should call onDateClick when a day cell is clicked', () => {
    spyOn(component, 'onDateClick');
    const firstDayCell = fixture.debugElement.query(By.css('.day-cell')).nativeElement;
    firstDayCell.click();
    expect(component.onDateClick).toHaveBeenCalled();
  });

  it('should highlight today with .today class', () => {
    const todayCell = fixture.debugElement.query(By.css('.today'));
    expect(todayCell).toBeTruthy();
  });

  it('should close modal on onModalClose', () => {
    component.showModal = true;
    component.onModalClose();
    expect(component.showModal).toBeFalse();
  });

  it('should save event and close modal', () => {
    const newEvent: CalendarEvent = { ...sampleEvent, id: '2', title: 'New Event' };

    component.showModal = true;
    component.onEventSave(newEvent);

    expect(eventServiceSpy.addEvent).toHaveBeenCalledWith(newEvent);
    expect(component.showModal).toBeFalse();
  });

  it('should format date correctly', () => {
    const date = new Date(2025, 0, 5); // 2025-01-05
    const formatted = (component as any).getFormattedDate(date);
    expect(formatted).toBe('2025-01-05');
  });

  it('should open modal in view mode on event click', () => {
    component.onEventClick(sampleEvent);

    expect(component.selectedEvent).toEqual(sampleEvent);
    expect(component.modalMode).toBe(ModalMode.View);
    expect(component.showModal).toBeTrue();
  });

  it('onDateClick should set selectedDate, modalMode and showModal', () => {
    const date = new Date('2025-09-11');
    component.onDateClick(date);

    expect(component.selectedDate).toBe('2025-09-11');
    expect(component.modalMode).toBe(ModalMode.Create);
    expect(component.showModal).toBeTrue();
  });

  it('onSearch should update searchQuery and call searchQuerySubject.next', () => {
    const spyNext = spyOn(component['searchQuerySubject'], 'next');
    const event = { target: { value: 'meet' } } as unknown as Event;

    component.onSearch(event);

    expect(component.searchQuery).toBe('meet');
    expect(spyNext).toHaveBeenCalledWith('meet');
  });

  it('onEventUpdate should call service, close modal and regenerate calendar', () => {
    spyOn(component, 'onModalClose');
    component.onEventUpdate(sampleEvent);

    expect(eventServiceSpy.updateEvent).toHaveBeenCalledWith(sampleEvent);
    expect(component.onModalClose).toHaveBeenCalled();
  });

  it('onEventDelete should call service, hide modal and regenerate calendar', () => {
    component.onEventDelete(sampleEvent.id);

    expect(eventServiceSpy.deleteEvent).toHaveBeenCalledWith(sampleEvent.id);
    expect(component.showModal).toBeFalse();
  });

  it('onEventDrop should update event with new date and regenerate calendar', () => {
    spyOn(component, 'toggleExpanded');

    const dropEvent = {
      item: { data: sampleEvent },
      event: {
        target: { closest: () => ({ getAttribute: () => '2025-09-15' }) }
      }
    } as unknown as CdkDragDrop<CalendarEvent[]>;

    component.onEventDrop(dropEvent);

    expect(eventServiceSpy.updateEvent).toHaveBeenCalledWith({
      ...sampleEvent,
      date: '2025-09-15'
    });
    expect(component.toggleExpanded).toHaveBeenCalledWith(null);
  });

  it('onEventDrop should return early if no targetDate', () => {
    const dropEvent = {
      item: { data: sampleEvent },
      event: { target: { closest: () => null } }
    } as unknown as CdkDragDrop<CalendarEvent[]>;

    component.onEventDrop(dropEvent);

    expect(eventServiceSpy.updateEvent).not.toHaveBeenCalled();
  });

  it('filterEvents should clear results if query is empty', () => {
    component['filterEvents']('');
    expect(component.searchResults.length).toBe(0);
  });

  it('filterEvents should filter events by title, description or category', () => {
    // Arrange
    eventServiceSpy.events$ = of([sampleEvent]); // ensure observable

    // Act
    component['filterEvents']('event');

    // Assert
    expect(component.searchResults.length).toBe(1);
    expect(component.searchResults[0].title).toBe('Test Event');
  });

  it('toggleExpanded should set formatted date when date provided', () => {
    component.toggleExpanded(new Date('2025-09-20'));
    expect(component.expandedDate).toBe('2025-09-20');
  });

  it('toggleExpanded should clear expandedDate when null passed', () => {
    component.toggleExpanded(null);
    expect(component.expandedDate).toBeNull();
  });

});