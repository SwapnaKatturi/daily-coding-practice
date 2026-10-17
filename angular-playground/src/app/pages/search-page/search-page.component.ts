import { Component, signal } from '@angular/core';
import { TypeaheadComponent } from '../../tasks/day-03-accessible-typeahead-search/typeahead.component';

@Component({
    selector: 'app-search-page',
    standalone: true,
    imports: [TypeaheadComponent],
    templateUrl: './search-page.component.html',
})
export class SearchPageComponent {
    selected = signal<string | null>(null);

    onSelection(item: string): void {
        this.selected.set(item);
    }
}
