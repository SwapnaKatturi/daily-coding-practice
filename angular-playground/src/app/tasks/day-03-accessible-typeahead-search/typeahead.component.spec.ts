import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { delay, of } from 'rxjs';
import { TypeaheadComponent } from './typeahead.component';
import { FruitService } from './fruit.service';

describe('TypeaheadComponent', () => {
    let fixture: ComponentFixture<TypeaheadComponent>;
    let component: TypeaheadComponent;
    let fruitService: jasmine.SpyObj<FruitService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('FruitService', ['search']);
        await TestBed.configureTestingModule({
            imports: [TypeaheadComponent],
            providers: [{ provide: FruitService, useValue: spy }],
        }).compileComponents();

        fixture = TestBed.createComponent(TypeaheadComponent);
        component = fixture.componentInstance;
        fruitService = TestBed.inject(FruitService) as jasmine.SpyObj<FruitService>;
        fruitService.search.and.callFake((term: string) =>
            of(['Apple', 'Apricot'].filter(f => f.toLowerCase().includes(term.toLowerCase())))
                .pipe(delay(400))
        );
        fixture.detectChanges();
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

    it('does not call the API before 300ms debounce; calls it after', fakeAsync(() => {
        typeText('ap');
        tick(200);
        expect(fruitService.search).not.toHaveBeenCalled();
        tick(100); // 300ms total → debounce fires, API call starts (400ms delay)
        expect(fruitService.search).toHaveBeenCalledTimes(1);
        expect(fruitService.search).toHaveBeenCalledWith('ap');
        tick(400); // let the fake API respond
        fixture.detectChanges();
        expect(component.suggestions()).toEqual(['Apple', 'Apricot']);
        expect(component.isOpen()).toBeTrue();
    }));

    it('calls the API only once when typing the same term twice', fakeAsync(() => {
        typeText('ap');
        tick(300);
        tick(400);
        typeText('ap'); // identical term → distinctUntilChanged drops it
        tick(300);
        tick(400);
        expect(fruitService.search).toHaveBeenCalledTimes(1);
    }));

    it('selects the active option with Enter', fakeAsync(() => {
        let selected: string | undefined;
        component.selectionChange.subscribe(v => (selected = v));
        typeText('ap');
        tick(300);
        tick(400);
        fixture.detectChanges();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        fixture.detectChanges();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();
        expect(selected).toBe('Apple');
        expect(input.value).toBe('Apple');
        expect(component.isOpen()).toBeFalse();
    }));
});
