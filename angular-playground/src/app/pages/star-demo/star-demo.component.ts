import { Component, signal } from '@angular/core';
import { StarRatingComponent } from '../../tasks/day-01-star-rating/star-rating.component';

@Component({
    selector: 'app-star-demo',
    standalone: true,
    imports: [StarRatingComponent],
    templateUrl: './star-demo.component.html',
})
export class StarDemoComponent {
    rating = signal(3);

    onRatingChange(newRating: number): void {
        this.rating.set(newRating);
    }
}
