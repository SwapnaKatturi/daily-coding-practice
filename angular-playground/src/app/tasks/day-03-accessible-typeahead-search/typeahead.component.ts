import { Component, DestroyRef, ElementRef, HostListener, inject, input, OnInit, output, signal } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap, tap } from 'rxjs';
import { FruitService } from './fruit.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-typeahead',
    standalone: true,
    templateUrl: './typeahead.component.html',
    styleUrl: './typeahead.component.css'
})
export class TypeaheadComponent implements OnInit {
    private static typeaheadIdCounter = 0;

    placeholder = input('Search fruits...');
    selectionChange = output<string>();

    private fruitService = inject(FruitService);
    private destroyRef = inject(DestroyRef);
    private host = inject(ElementRef<HTMLElement>);

    private readonly uid = TypeaheadComponent.typeaheadIdCounter++;
    readonly inputId = `typeahead-input-${this.uid}`;
    readonly listboxId = `typeahead-listbox-${this.uid}`;

    query = signal('');
    suggestions = signal<string[]>([]);
    isLoading = signal(false);
    isOpen = signal(false);
    activeIndex = signal(-1);
    statusMessage = signal('');
    private searchTerms = new Subject<string>();


    ngOnInit(): void {
        this.searchTerms
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                tap(() => {
                    this.isLoading.set(true);
                    this.statusMessage.set('Loading suggestions');
                }),
                switchMap(term =>
                    this.fruitService.search(term).pipe(catchError(() => of<string[]>([])))
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(
                results => {
                    this.isLoading.set(false);
                    this.suggestions.set(results);
                    this.activeIndex.set(-1);
                    this.isOpen.set(true);
                    this.statusMessage.set(
                        results.length === 0 ? 'No results found' : `${results.length} suggestion${results.length === 1}? '':'s'} available`
                    );
                }
            );
    }

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.query.set(value)
        if (value.trim().length < 2) {
            this.suggestions.set([]);
            this.isOpen.set(false);
            this.isLoading.set(false);
            this.activeIndex.set(-1);
            this.statusMessage.set('');
            return;
        }
        this.searchTerms.next(value);
    }


    onKeydown(event: KeyboardEvent): void {
        const open = this.isOpen();
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!open) { this.isOpen.set(true); break; }
                this.moveActive(1);
                break;

            case 'ArrowUp':
                event.preventDefault();
                if (open) this.moveActive(-1);
                break;

            case 'Enter':
                if (open && this.activeIndex() >= 0) {
                    event.preventDefault();
                    this.select(this.suggestions()[this.activeIndex()]);
                }
                break;

            case 'Escape':
                if (open) {
                    event.preventDefault();
                    this.closeList();
                }
                break;
        }
    }

    select(item: string): void {
        this.query.set(item);
        this.selectionChange.emit(item);
        this.closeList();
    }

    optionId(index: number): string {
        return `typeahead-option-${this.uid}-${index}`;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.host.nativeElement.contains(event.target as Node)) {
            this.closeList();
        }
    }

    private moveActive(delta: number): void {
        const count = this.suggestions().length;
        if (count === 0) return;
        const current = this.activeIndex();
        let next: number;
        if (current === -1) {
            next = delta > 0 ? 0 : count - 1;
        } else {
            next = (current + delta + count) % count
        }
        this.activeIndex.set(next)
    }

    private closeList(): void {
        this.isOpen.set(false);
        this.activeIndex.set(-1);
    }
}