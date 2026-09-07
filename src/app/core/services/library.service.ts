import { computed, Injectable, signal } from '@angular/core';
import { Playlist } from '../../shared/models/playlist.model';
import { Track } from '../../shared/models/track.model';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  readonly playlists = signal<Playlist[]>([]);
  readonly selectedPlaylist = signal<Playlist | null>(null);
  readonly currentTrack = signal<Track | null>(null);
  readonly addPanelOpen = signal(true);
  readonly tracks = computed(() => this.selectedPlaylist()?.tracks ?? []);

  selectPlaylist(playlist: Playlist): void {
    this.selectedPlaylist.set(playlist);
  }

  toggleAddPanel(): void {
    this.addPanelOpen.update((open) => !open);
  }
}
