import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
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
  readonly query = signal('');

  readonly visibleTracks = computed(() => {
    const query = this.query().trim().toLowerCase();
    const tracks = this.tracks();

    if (!query) {
      return tracks;
    }

    return tracks.filter((track) =>
      [track.title, track.artist, track.album, track.year, track.genre].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  });

  constructor() {
    effect(() => {
      this.selectedPlaylist()?.name;
      untracked(() => this.query.set(''));
    });
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  openAddPanel(): void {
    if (!this.selectedPlaylist()) {
      return;
    }

    this.playlistUi.openAddPanel();
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
