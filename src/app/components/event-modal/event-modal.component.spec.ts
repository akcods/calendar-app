import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EventModalComponent } from './event-modal.component';
import { CalendarEvent, Categories, ModalMode } from '../../models/constants';

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

  it('should open event in View mode when openEvent is called', () => {
    component.openEvent(sampleEvent);
    expect(component.mode).toBe(ModalMode.View);
    expect(component.selectedEvent).toEqual(sampleEvent);
  });

  it('should patch form and set mode to Update when editEvent is called', () => {
    component.editEvent(sampleEvent);

    expect(component.mode).toBe(ModalMode.Update);
    expect(component.selectedEvent).toEqual(sampleEvent);
    expect(component.form.value).toEqual({
      title: sampleEvent.title,
      description: sampleEvent.description,
      category: sampleEvent.category
    });
  });

  it('should emit updated event and reset form when updateEvent is called', () => {
    const spyUpdate = spyOn(component.update, 'emit');
    component.selectedEvent = { ...sampleEvent };

    // patch form values to simulate edit
    component.form.patchValue({
      title: 'Updated Title',
      description: 'Updated Desc',
      category: 'Personal'
    });

    component.updateEvent();

    expect(spyUpdate).toHaveBeenCalled();
    const emittedEvent = spyUpdate.calls.mostRecent().args[0] as CalendarEvent;

    expect(emittedEvent.id).toBe(sampleEvent.id);
    expect(emittedEvent.title).toBe('Updated Title');
    expect(emittedEvent.description).toBe('Updated Desc');
    expect(emittedEvent.category).toBe('Personal');
    expect(emittedEvent.color).toBe(Categories.find(c => c.name === 'Personal')!.color);

    expect(component.form.value).toEqual({
      title: null,
      description: null,
      category: null
    });
  });

});
