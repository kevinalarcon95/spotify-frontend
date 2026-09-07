import { Injectable, signal } from '@angular/core';
import { Playlist } from '../../shared/models/playlist.model';

@Injectable({ providedIn: 'root' })
export class PlaylistUiService {
  readonly formOpen = signal(false);
  readonly formMode = signal<'create' | 'edit'>('create');
  readonly addPanelOpen = signal(true);
  readonly pendingDelete = signal<Playlist | null>(null);

  openCreateForm(): void {
    this.formMode.set('create');
    this.formOpen.set(true);
  }

  openEditForm(): void {
    this.formMode.set('edit');
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  requestDelete(playlist: Playlist): void {
    this.pendingDelete.set(playlist);
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  toggleAddPanel(): void {
    this.addPanelOpen.update((open) => !open);
  }

  reset(): void {
    this.formOpen.set(false);
    this.pendingDelete.set(null);
  }
}
