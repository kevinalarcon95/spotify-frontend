import { Component, inject } from '@angular/core';
import { LibraryService } from '../../core/services/library.service';
import { Empty } from '../../shared/ui/empty/empty';

@Component({
  selector: 'app-home',
  imports: [Empty],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly library = inject(LibraryService);

  readonly selectedPlaylist = this.library.selectedPlaylist;
  readonly tracks = this.library.tracks;

  toggleAddPanel(): void {
    this.library.toggleAddPanel();
  }
}
