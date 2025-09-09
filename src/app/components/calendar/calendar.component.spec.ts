import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { By } from '@angular/platform-browser';
import { DAYS } from '../../models/constants';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
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
});
