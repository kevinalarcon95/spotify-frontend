import { Component, inject } from '@angular/core';
import { LibraryService } from '../../core/services/library.service';
import { PlaylistUiService } from '../../core/services/playlist-ui.service';
import { Empty } from '../../shared/ui/empty/empty';

@Component({
  selector: 'app-home',
  imports: [Empty],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly library = inject(LibraryService);
  private readonly playlistUi = inject(PlaylistUiService);

  readonly selectedPlaylist = this.library.selectedPlaylist;
  readonly tracks = this.library.tracks;

  toggleAddPanel(): void {
    this.playlistUi.toggleAddPanel();
  }

  openEditForm(): void {
    if (!this.selectedPlaylist()) {
      return;
    }

    this.playlistUi.openEditForm();
  }

  deletePlaylist(): void {
    const playlist = this.selectedPlaylist();

    if (playlist) {
      this.playlistUi.requestDelete(playlist);
    }
  }
}
