import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarEvent, Categories, ModalMode } from '../../models/constants';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './event-modal.component.html',
  styleUrl: './event-modal.component.scss'
})
export class EventModalComponent {
  modalMode = ModalMode;

  @Input() mode: ModalMode = ModalMode.Create;
  @Input() selectedDate!: string;
  @Input() selectedEvent?: CalendarEvent;
  @Input() existingEvents: CalendarEvent[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CalendarEvent>();
  @Output() delete = new EventEmitter<string>();
  @Output() update = new EventEmitter<CalendarEvent>();

  categories = Categories;

  constructor(private fb: FormBuilder) { }

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    category: ['Work', Validators.required],
  });

  selectEvent(event: CalendarEvent) {
    this.selectedEvent = { ...event };
  }

  onSubmit() {
    if (this.form.invalid) return;

    const category = this.categories.find(c => c.name === this.form.value.category)!;

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: this.form.value.title!,
      description: this.form.value.description!,
      date: this.selectedDate,
      category: category.name,
      color: category.color,
    };

    this.save.emit(newEvent);
    this.form.reset();
  }

  editEvent(event: CalendarEvent) {
    this.mode = ModalMode.Update;
    this.selectedEvent = event;
    this.form.patchValue({
      title: event.title,
      description: event.description,
      category: event.category
    });
  }

  updateEvent() {
    const category = this.categories.find(c => c.name === this.form.value.category)!;

    let updatedEvent: CalendarEvent = { ...this.selectedEvent! };
    updatedEvent.title = this.form.value.title!;
    updatedEvent.description = this.form.value.description!;
    updatedEvent.category = category.name;
    updatedEvent.color = category.color;

    this.update.emit(updatedEvent);
    this.form.reset();
  }

  openEvent(event: CalendarEvent) {
    this.selectedEvent = event;
    this.mode = ModalMode.View;
  }


  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.delete.emit(id);
    }
  }

  closeModal() {
    this.close.emit();
  }
}
