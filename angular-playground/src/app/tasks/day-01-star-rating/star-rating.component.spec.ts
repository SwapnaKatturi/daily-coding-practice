import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarRatingComponent } from './star-rating.component';
import { OutputEmitterRef } from '@angular/core';

describe('StarRatingComponent', () => {
  let fixture: ComponentFixture<StarRatingComponent>;
  let component: StarRatingComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarRatingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StarRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render 5 stars by default', () => {
    const stars = fixture.nativeElement.querySelectorAll('.star');
    expect(stars.length).toBe(5);
  });

  it('should render a custom number of stars', () => {
    fixture.componentRef.setInput('maxStars', 3);
    fixture.detectChanges();
    const stars = fixture.nativeElement.querySelectorAll('.star');
    expect(stars.length).toBe(3);
  });

  it('should emit the clicked star value', () => {
    spyOn(component.ratingChange, 'emit');
    const stars = fixture.nativeElement.querySelectorAll('.star');
    (stars[2] as HTMLElement).click(); // click the 3rd star
    fixture.detectChanges();
    expect(component.ratingChange.emit).toHaveBeenCalledWith(3);
    expect(component.currentRating()).toBe(3);
  });

  it('should clear the rating when clicking the selected star again', () => {
    spyOn(component.ratingChange, 'emit');
    const stars = fixture.nativeElement.querySelectorAll('.star');
    (stars[3] as HTMLElement).click();
    (stars[3] as HTMLElement).click(); // click again to clear
    fixture.detectChanges();
    expect(component.ratingChange.emit).toHaveBeenCalledWith(0);
    expect(component.currentRating()).toBe(0);
  });

  it('should change the rating with arrow keys', () => {
    fixture.componentRef.setInput('rating', 2);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(component.currentRating()).toBe(3);

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(component.currentRating()).toBe(2);
  });

  it('should jump to 0 with Home and max with End', () => {
    const host: HTMLElement = fixture.nativeElement;

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(component.currentRating()).toBe(5);

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(component.currentRating()).toBe(0);
  });

  it('should ignore clicks and keys when readonly', () => {
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();
    spyOn(component.ratingChange, 'emit');

    const stars = fixture.nativeElement.querySelectorAll('.star');
    (stars[4] as HTMLElement).click();
    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

    expect(component.ratingChange.emit).not.toHaveBeenCalled();
    expect(component.currentRating()).toBe(0);
  });

  it('should expose slider semantics to assistive tech', () => {
    fixture.componentRef.setInput('rating', 4);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('slider');
    expect(host.getAttribute('aria-valuenow')).toBe('4');
    expect(host.getAttribute('aria-valuemax')).toBe('5');
  });
});
function spyOn(ratingChange: OutputEmitterRef<number>, arg1: string) {
  throw new Error('Function not implemented.');
}

