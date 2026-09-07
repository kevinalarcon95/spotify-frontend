import { Component, inject, signal } from '@angular/core';
import { LibraryService } from '../../../core/services/library.service';
import { PlaylistUiService } from '../../../core/services/playlist-ui.service';
import { resolveApiError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-playlist-delete',
  templateUrl: './playlist-delete.html',
  styleUrl: './playlist-delete.css',
  host: {
    '(click)': 'cancel()',
    '(document:keydown.escape)': 'cancel()',
  },
})
export class PlaylistDelete {
  private readonly library = inject(LibraryService);
  private readonly playlistUi = inject(PlaylistUiService);

  readonly playlist = this.playlistUi.pendingDelete;
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  cancel(): void {
    if (this.saving()) {
      return;
    }

    this.playlistUi.cancelDelete();
  }

  async confirm(): Promise<void> {
    const name = this.playlist()?.name;

    if (!name) {
      this.error.set('No se pudo identificar la lista.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      await this.library.deletePlaylist(name);
      this.playlistUi.closeAddPanel();
      this.playlistUi.cancelDelete();
    } catch (err) {
      this.error.set(resolveApiError(err, 'No se pudo eliminar la lista.'));
    } finally {
      this.saving.set(false);
    }
  }
}
