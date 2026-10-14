import { Component, signal } from '@angular/core';
import { StarRatingComponent } from './tasks/day-01-star-rating/star-rating.component';

@Component({
  imports: [StarRatingComponent],
  standalone: true,
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  rating = signal(3);

  onRatingChange(newRating: number): void {
    this.rating.set(newRating);
  }

  protected readonly title = signal('star-rating-demo');
}
