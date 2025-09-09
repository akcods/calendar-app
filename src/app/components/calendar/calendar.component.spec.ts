import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { By } from '@angular/platform-browser';
import { CalendarEvent, DAYS } from '../../models/constants';
import { EventService } from '../../services/event.service';
import { EventModalComponent } from '../event-modal/event-modal.component';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let eventService: jasmine.SpyObj<EventService>;

  const sampleDate = new Date(2025, 8, 10);
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
    const Spy = jasmine.createSpyObj('EventService', ['getEventsByDate', 'addEvent', 'deleteEvent']);

    await TestBed.configureTestingModule({
      imports: [CalendarComponent, EventModalComponent],
      providers: [{ provide: EventService, useValue: Spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    eventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;

    eventService.getEventsByDate.and.returnValue([sampleEvent]);
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

  it('shoulld open modal on date click and set modalEvents', () => {
    component.onDateClick(sampleDate);

    expect(component.selectedDate).toBe(formattedDate);
    expect(component.modalEvents.length).toBe(1);
    expect(component.showModal).toBeTrue();
    expect(eventService.getEventsByDate).toHaveBeenCalledWith(formattedDate);
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

    expect(eventService.addEvent).toHaveBeenCalledWith(newEvent);
    expect(component.showModal).toBeFalse();
  });

  it('should delete event and update modalEvents', () => {
    component.modalEvents = [sampleEvent];
    component.onEventDelete(sampleEvent.id);

    expect(eventService.deleteEvent).toHaveBeenCalledWith(sampleEvent.id);
    expect(component.modalEvents.length).toBe(0);
  });

  it('should format date correctly', () => {
    const date = new Date(2025, 0, 5); // 2025-01-05
    const formatted = (component as any).getFormattedDate(date);
    expect(formatted).toBe('2025-01-05');
  });

  it('should pass correct inputs to EventModalComponent', () => {
    component.selectedDate = formattedDate;
    component.modalEvents = [sampleEvent];
    component.showModal = true;
    fixture.detectChanges();

    const modalDebug = fixture.debugElement.query(By.directive(EventModalComponent));
    expect(modalDebug).toBeTruthy();

    const modalInstance = modalDebug.componentInstance as EventModalComponent;
    expect(modalInstance.selectedDate).toBe(formattedDate);
    expect(modalInstance.existingEvents).toEqual([sampleEvent]);
  });
});
