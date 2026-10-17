import { ComponentFixture, TestBed } from '@angular/core/testing';
import { delay, of } from 'rxjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TypeaheadComponent } from './typeahead.component';
import { FruitService } from './fruit.service';

describe('TypeaheadComponent', () => {
    let fixture: ComponentFixture<TypeaheadComponent>;
    let component: TypeaheadComponent;
    let searchSpy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        searchSpy = vi.fn((term: string) =>
            of(['Apple', 'Apricot'].filter(f => f.toLowerCase().includes(term.toLowerCase()))).pipe(delay(400))
        );

        await TestBed.configureTestingModule({
            imports: [TypeaheadComponent],
            providers: [{ provide: FruitService, useValue: { search: searchSpy } }],
        }).compileComponents();

        fixture = TestBed.createComponent(TypeaheadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function typeText(text: string) {
        const input = fixture.nativeElement.querySelector('input');
        input.value = text;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
    }

    it('creates the component', () => {
        expect(component).toBeTruthy();
    });

    it('does not call the API before 300ms debounce; calls it after', () => {
        typeText('ap');
        vi.advanceTimersByTime(200);
        expect(searchSpy).not.toHaveBeenCalled();
        vi.advanceTimersByTime(100); // 300ms total → debounce fires, API call starts (400ms delay)
        expect(searchSpy).toHaveBeenCalledTimes(1);
        expect(searchSpy).toHaveBeenCalledWith('ap');
        vi.advanceTimersByTime(400); // let the fake API respond
        fixture.detectChanges();
        expect(component.suggestions()).toEqual(['Apple', 'Apricot']);
        expect(component.isOpen()).toBe(true);
    });

    it('calls the API only once when typing the same term twice', () => {
        typeText('ap');
        vi.advanceTimersByTime(300);
        vi.advanceTimersByTime(400);
        typeText('ap'); // identical term → distinctUntilChanged drops it
        vi.advanceTimersByTime(300);
        vi.advanceTimersByTime(400);
        expect(searchSpy).toHaveBeenCalledTimes(1);
    });

    it('selects the active option with Enter', () => {
        let selected: string | undefined;
        component.selectionChange.subscribe(v => (selected = v));
        typeText('ap');
        vi.advanceTimersByTime(300);
        vi.advanceTimersByTime(400);
        fixture.detectChanges();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        fixture.detectChanges();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();
        expect(selected).toBe('Apple');
        expect(input.value).toBe('Apple');
        expect(component.isOpen()).toBe(false);
    });
});
