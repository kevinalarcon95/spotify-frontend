import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Playlist } from '../../shared/models/playlist.model';
import { Empty } from '../../shared/ui/empty/empty';
import { AuthService } from '../services/auth.service';
import { LibraryService } from '../services/library.service';

@Component({
  selector: 'app-layout',
  imports: [Empty, RouterLink, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly authService = inject(AuthService);
  private readonly library = inject(LibraryService);
  private readonly router = inject(Router);

  readonly playlists = this.library.playlists;
  readonly selectedPlaylist = this.library.selectedPlaylist;
  readonly currentTrack = this.library.currentTrack;
  readonly addPanelOpen = this.library.addPanelOpen;

  readonly displayName = computed(
    () => this.authService.user()?.name || this.authService.user()?.username || 'Usuario',
  );
  readonly initial = computed(() => this.displayName().charAt(0).toUpperCase());

  selectPlaylist(playlist: Playlist): void {
    this.library.selectPlaylist(playlist);
  }

  toggleAddPanel(): void {
    this.library.toggleAddPanel();
  }

  async logout(): Promise<void> {
    this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
