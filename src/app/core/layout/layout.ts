import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Playlist, TrackHit } from '../../shared/models/playlist.model';
import { Empty } from '../../shared/ui/empty/empty';
import { PlaylistForm } from '../../shared/ui/playlist-form/playlist-form';
import { PlaylistDelete } from '../../shared/ui/playlist-delete/playlist-delete';
import { SongForm } from '../../shared/ui/song-form/song-form';
import { AuthService } from '../services/auth.service';
import { LibraryService } from '../services/library.service';
import { PlaylistUiService } from '../services/playlist-ui.service';

@Component({
  selector: 'app-layout',
  imports: [Empty, PlaylistForm, PlaylistDelete, RouterLink, RouterOutlet, SongForm],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly authService = inject(AuthService);
  private readonly library = inject(LibraryService);
  private readonly playlistUi = inject(PlaylistUiService);
  private readonly router = inject(Router);

  readonly playlists = this.library.playlists;
  readonly selectedPlaylist = this.library.selectedPlaylist;
  readonly currentTrack = this.library.currentTrack;
  readonly loading = this.library.loading;
  readonly error = this.library.error;
  readonly addPanelOpen = this.playlistUi.addPanelOpen;
  readonly formOpen = this.playlistUi.formOpen;
  readonly pendingDelete = this.playlistUi.pendingDelete;
  readonly searchQuery = this.library.searchQuery;
  readonly searchHits = this.library.searchHits;

  readonly displayName = computed(
    () => this.authService.user()?.name || this.authService.user()?.username || 'Usuario',
  );
  readonly initial = computed(() => this.displayName().charAt(0).toUpperCase());

  constructor() {
    void this.library.loadPlaylists();
  }

  selectPlaylist(playlist: Playlist): void {
    if (this.selectedPlaylist()?.name !== playlist.name) {
      this.playlistUi.closeAddPanel();
    }

    void this.library.selectPlaylist(playlist);
  }

  openCreateForm(): void {
    this.playlistUi.openCreateForm();
  }

  deletePlaylist(playlist: Playlist): void {
    this.playlistUi.requestDelete(playlist);
  }

  closeAddPanel(): void {
    this.playlistUi.closeAddPanel();
  }

  onGlobalSearch(event: Event): void {
    this.library.setSearchQuery((event.target as HTMLInputElement).value);
  }

  async openSearchHit(hit: TrackHit): Promise<void> {
    this.library.playTrack(hit.track);
    this.library.clearSearch();
    this.selectPlaylist(hit.playlist);
  }

  async logout(): Promise<void> {
    this.library.reset();
    this.playlistUi.reset();
    this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
