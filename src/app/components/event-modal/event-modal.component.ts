import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarEvent, Categories } from '../../models/constants';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-modal.component.html',
  styleUrl: './event-modal.component.scss'
})
export class EventModalComponent {
  @Input() selectedDate!: string;
  @Input() existingEvents: CalendarEvent[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CalendarEvent>();
  @Output() delete = new EventEmitter<string>();

  constructor(private fb: FormBuilder) { }

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    category: ['Work', Validators.required],
  });

  categories = Categories;


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

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.delete.emit(id);
    }
  }

  closeModal() {
    this.close.emit();
  }
}
