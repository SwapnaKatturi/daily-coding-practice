import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, input, output, signal } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-star-rating',
  standalone: true,
  styleUrl: './star-rating.component.css',
  templateUrl: './star-rating.component.html',
  host: {
    'tabindex': '0',
    'role': 'slider',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'maxStars()',
    '[attr.aria-valuenow]': 'currentRating()',
    '[attr.aria-label]': '"Star rating, " + currentRating() + " of " + maxStars()',
    'class': 'star-rating-host'
  }
})
export class StarRatingComponent {
  //Inputs
  rating = input<number>(0);
  maxStars = input<number>(5);
  readOnly = input<boolean>(false);

  //Output
  ratingChange = output<number>();

  //Internal Signal, initialized from the input , updated as user interacts

  private internalRating = signal<number | null>(null);
  currentRating = computed(() => this.internalRating() ?? this.rating());

  stars = computed(() => Array.from({ length: this.maxStars() }, (_, i) => i + 1));

  hoveredStar = signal<number | null>(null);

  displayRating = computed(() => this.hoveredStar() ?? this.currentRating());

  selectStar(star: number): void {
    if (this.readOnly()) return;

    const newRating = this.currentRating() === star ? 0 : star;

    this.internalRating.set(newRating);
    this.ratingChange.emit(newRating);

  }

  onMouseEnter(star: number): void {
    if (this.readOnly()) return;
    this.hoveredStar.set(star);
  }

  onMouseLeave(): void {
    if (this.readOnly()) return;
    this.hoveredStar.set(null);
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.readOnly()) return;

    const max = this.maxStars();
    const current = this.currentRating();

    let newRating: number | null = null;

    switch (event.key) {
      case 'ArrowLeft':
      case "ArrowDown":
        newRating = Math.max(0, current - 1);
        break;

      case 'ArrowRight':
      case 'ArrowUp':
        newRating = Math.min(max, current + 1);
        break;
      case "Home":
        newRating = 0;
        break;
      case 'End':
        newRating = max;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.internalRating.set(newRating);
    this.ratingChange.emit(newRating);
  }

}
