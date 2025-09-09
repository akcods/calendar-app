import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EventModalComponent } from './event-modal.component';
import { CalendarEvent, Categories } from '../../models/constants';

describe('EventModalComponent', () => {
  let component: EventModalComponent;
  let fixture: ComponentFixture<EventModalComponent>;

  const mockDate = '2025-09-09';
  const sampleEvent: CalendarEvent = {
    id: '1',
    title: 'Test Event',
    description: 'desc',
    date: mockDate,
    category: 'Work',
    color: '#2196f3',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventModalComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(EventModalComponent);
    component = fixture.componentInstance;

    component.selectedDate = mockDate;
    component.existingEvents = [sampleEvent];
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with title, description and category', () => {
    expect(component.form.contains('title')).toBeTrue();
    expect(component.form.contains('description')).toBeTrue();
    expect(component.form.contains('category')).toBeTrue();
  });

  it('should not submit if form is invalid', () => {
    spyOn(component.save, 'emit');
    component.form.setValue({ title: '', description: '', category: 'Work' });
    component.onSubmit();
    expect(component.save.emit).not.toHaveBeenCalled();
  });

  it('should emit save event when form is valid', () => {
    spyOn(component.save, 'emit');
    component.form.setValue({ title: 'Meeting', description: 'Planning', category: 'Work' });

    component.onSubmit();

    expect(component.save.emit).toHaveBeenCalled();
    const emittedEvent = (component.save.emit as jasmine.Spy).calls.mostRecent().args[0] as CalendarEvent;
    expect(emittedEvent.title).toBe('Meeting');
    expect(emittedEvent.date).toBe(mockDate);
    expect(emittedEvent.category).toBe('Work');
    expect(emittedEvent.color).toBe(Categories.find(c => c.name === 'Work')?.color!);
  });

  it('should emit delete event when onDelete is confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.delete, 'emit');

    component.onDelete(sampleEvent.id);

    expect(component.delete.emit).toHaveBeenCalledWith(sampleEvent.id);
  });

  it('should not emit delete event when onDelete is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component.delete, 'emit');

    component.onDelete(sampleEvent.id);

    expect(component.delete.emit).not.toHaveBeenCalled();
  });

  it('should emit close event when closeModal is called', () => {
    spyOn(component.close, 'emit');

    component.closeModal();

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should render existing events list', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const listItems = compiled.querySelectorAll('.existing ul li');
    expect(listItems.length).toBe(1);
    expect(listItems[0].textContent).toContain('Test Event');
  });
});
