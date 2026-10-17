import { Injectable } from "@angular/core";
import { delay, of } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class FruitService {
    private readonly fruits = [
        'Apple', 'Apricot', 'Banana', 'Avocado', 'Blueberry', 'Cherry', 'Coconut', 'Grape', 'Kiwi', 'Lemon', 'Mango', 'Orange',
        'Papaya', 'Peach', 'Pear', 'Pineapple', 'Plum', 'Raspberry', 'Strawberry', 'Watermelon'
    ]

    search(term: string) {
        const q = term.trim().toLowerCase();
        const results = this.fruits.filter(f =>
            f.toLowerCase().includes(q)
        )
        return of(results).pipe(delay(400))
    }
}