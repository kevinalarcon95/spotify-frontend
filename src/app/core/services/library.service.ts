import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Playlist, TrackHit } from '../../shared/models/playlist.model';
import { Track } from '../../shared/models/track.model';
import { resolveApiError } from '../utils/http-error';
import { AuthService } from './auth.service';
import { PlaylistService } from './playlist.service';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly playlistApi = inject(PlaylistService);
  private readonly auth = inject(AuthService);

  readonly playlists = signal<Playlist[]>([]);
  readonly currentTrack = signal<Track | null>(null);
  readonly searchQuery = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly selectedName = signal<string | null>(null);

  readonly selectedPlaylist = computed(
    () => this.playlists().find((playlist) => playlist.name === this.selectedName()) ?? null,
  );
  readonly tracks = computed(() => this.selectedPlaylist()?.tracks ?? []);
  readonly searchHits = computed<TrackHit[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return [];
    }

    return this.playlists().flatMap((playlist) =>
      (playlist.tracks ?? [])
        .filter((track) =>
          [track.title, track.artist, track.genre].some((value) =>
            value.toLowerCase().includes(query),
          ),
        )
        .map((track) => ({ track, playlist })),
    );
  });

  async loadPlaylists(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const playlists = await firstValueFrom(this.playlistApi.getAll());
      this.playlists.set(playlists ?? []);

      const selected = this.selectedName();
      if (selected && !this.playlists().some((playlist) => playlist.name === selected)) {
        this.selectedName.set(null);
      }
    } catch (err) {
      this.error.set(resolveApiError(err, 'No se pudieron cargar las listas.'));
    } finally {
      this.loading.set(false);
    }
  }

  async selectPlaylist(playlist: Playlist): Promise<void> {
    this.selectedName.set(playlist.name);

    try {
      const fresh = await firstValueFrom(this.playlistApi.getByName(playlist.name));
      this.replacePlaylist(playlist.name, fresh);
    } catch (err) {
      this.error.set(resolveApiError(err, 'No se pudo cargar la lista.'));
    }
  }

  nextDefaultName(): string {
    return `Mi lista n.° ${this.playlists().length + 1}`;
  }

  async createPlaylist(name: string, description: string): Promise<Playlist> {
    const created = await firstValueFrom(
      this.playlistApi.create({
        name,
        description,
        tracks: [],
      }),
    );

    this.playlists.update((list) => [...list, created]);
    this.selectedName.set(created.name);
    return created;
  }

  async updatePlaylist(name: string, description: string): Promise<Playlist> {
    const selected = this.selectedPlaylist();

    if (!selected) {
      throw new Error('missing-playlist');
    }

    const payload: Playlist = {
      name,
      description,
      tracks: selected.tracks ?? [],
    };

    if (name !== selected.name) {
      const created = await firstValueFrom(this.playlistApi.create(payload));
      await firstValueFrom(this.playlistApi.delete(selected.name));
      this.replacePlaylist(selected.name, created);
      return created;
    }

    await firstValueFrom(this.playlistApi.delete(selected.name));

    try {
      const created = await firstValueFrom(this.playlistApi.create(payload));
      this.replacePlaylist(selected.name, created);
      return created;
    } catch (err) {
      await this.loadPlaylists();
      throw err;
    }
  }

  async addTrack(track: Track): Promise<Playlist> {
    const selected = this.selectedPlaylist();

    if (!selected) {
      throw new Error('missing-playlist');
    }

    const payload: Playlist = {
      name: selected.name,
      description: selected.description,
      tracks: [...(selected.tracks ?? []), track],
    };

    await firstValueFrom(this.playlistApi.delete(selected.name));

    try {
      const created = await firstValueFrom(this.playlistApi.create(payload));
      this.replacePlaylist(selected.name, created);
      return created;
    } catch (err) {
      await this.loadPlaylists();
      throw err;
    }
  }

  async deletePlaylist(name: string): Promise<void> {
    await firstValueFrom(this.playlistApi.delete(name));
    this.playlists.update((list) => list.filter((item) => item.name !== name));

    if (this.selectedName() === name) {
      this.selectedName.set(null);
    }
  }

  setSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  playTrack(track: Track): void {
    this.currentTrack.set(track);
  }

  reset(): void {
    this.playlists.set([]);
    this.selectedName.set(null);
    this.currentTrack.set(null);
    this.searchQuery.set('');
    this.error.set(null);
  }

  private replacePlaylist(previousName: string, next: Playlist): void {
    this.playlists.update((list) =>
      list.map((playlist) => (playlist.name === previousName ? next : playlist)),
    );
    this.selectedName.set(next.name);
  }
}
