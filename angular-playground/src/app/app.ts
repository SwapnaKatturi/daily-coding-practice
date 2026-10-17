import { Component, signal } from '@angular/core';
import { StarDemoComponent } from './pages/star-demo/star-demo.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';

type PanelName = 'star' | 'search';

@Component({
  imports: [StarDemoComponent, SearchPageComponent],
  standalone: true,
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  // Which panel is open; null = all collapsed. Single-open accordion.
  openPanel = signal<PanelName | null>('star');

  togglePanel(name: PanelName): void {
    this.openPanel.set(this.openPanel() === name ? null : name);
  }

  isOpen(name: PanelName): boolean {
    return this.openPanel() === name;
  }
}
