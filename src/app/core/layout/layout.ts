import { Component, computed, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Playlist, TrackHit } from '../../shared/models/playlist.model';
import { Empty } from '../../shared/ui/empty/empty';
import { PlaylistForm } from '../../shared/ui/playlist-form/playlist-form';
import { PlaylistDelete } from '../../shared/ui/playlist-delete/playlist-delete';
import { SongForm } from '../../shared/ui/song-form/song-form';
import { AuthService } from '../services/auth.service';
import { LibraryService } from '../services/library.service';
import { PlaylistUiService } from '../services/playlist-ui.service';

type LibrarySort = 'recientes' | 'nombre' | 'canciones';

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
  readonly accountMenuOpen = signal(false);
  readonly librarySearchOpen = signal(false);
  readonly libraryQuery = signal('');
  readonly librarySort = signal<LibrarySort>('recientes');
  readonly sortMenuOpen = signal(false);

  readonly sortOptions: { id: LibrarySort; label: string }[] = [
    { id: 'recientes', label: 'Recientes' },
    { id: 'nombre', label: 'Alfabético' },
    { id: 'canciones', label: 'Más canciones' },
  ];

  private readonly librarySearchInput = viewChild<ElementRef<HTMLInputElement>>('librarySearchInput');

  readonly displayName = computed(
    () => this.authService.user()?.name || this.authService.user()?.username || 'Usuario',
  );
  readonly initial = computed(() => this.displayName().charAt(0).toUpperCase());
  readonly sortLabel = computed(
    () => this.sortOptions.find((option) => option.id === this.librarySort())?.label ?? 'Recientes',
  );
  readonly visiblePlaylists = computed(() => {
    const query = this.libraryQuery().trim().toLowerCase();
    const sort = this.librarySort();
    const source = this.playlists();
    const filtered = query
      ? source.filter(
          (playlist) =>
            playlist.name.toLowerCase().includes(query) ||
            playlist.description.toLowerCase().includes(query),
        )
      : source;

    if (sort === 'recientes') {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      if (sort === 'nombre') {
        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      }

      return (b.tracks?.length ?? 0) - (a.tracks?.length ?? 0);
    });
  });

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

  toggleAccountMenu(): void {
    this.accountMenuOpen.update((open) => !open);
  }

  toggleLibrarySearch(): void {
    const next = !this.librarySearchOpen();
    this.librarySearchOpen.set(next);

    if (!next) {
      this.libraryQuery.set('');
      return;
    }

    setTimeout(() => this.librarySearchInput()?.nativeElement.focus());
  }

  onLibrarySearch(event: Event): void {
    this.libraryQuery.set((event.target as HTMLInputElement).value);
  }

  toggleSortMenu(): void {
    this.sortMenuOpen.update((open) => !open);
  }

  setLibrarySort(sort: LibrarySort): void {
    this.librarySort.set(sort);
    this.sortMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeMenus(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target?.closest('.topbar__account')) {
      this.accountMenuOpen.set(false);
    }

    if (!target?.closest('.library__sort')) {
      this.sortMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.accountMenuOpen.set(false);
    this.sortMenuOpen.set(false);

    if (this.librarySearchOpen() && !this.libraryQuery().trim()) {
      this.librarySearchOpen.set(false);
    }
  }

  async logout(): Promise<void> {
    this.accountMenuOpen.set(false);
    this.library.reset();
    this.playlistUi.reset();
    this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
