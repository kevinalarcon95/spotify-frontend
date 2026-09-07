import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LibraryService } from '../../../core/services/library.service';
import { PlaylistUiService } from '../../../core/services/playlist-ui.service';
import { resolveApiError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-playlist-form',
  imports: [ReactiveFormsModule],
  templateUrl: './playlist-form.html',
  styleUrl: './playlist-form.css',
  host: {
    '(click)': 'close()',
    '(document:keydown.escape)': 'close()',
  },
})
export class PlaylistForm {
  private readonly library = inject(LibraryService);
  private readonly playlistUi = inject(PlaylistUiService);
  private readonly fb = inject(FormBuilder);
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  readonly title = this.playlistUi.formMode() === 'edit' ? 'Editar información' : 'Crear lista';
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    const playlist =
      this.playlistUi.formMode() === 'edit' ? this.library.selectedPlaylist() : null;

    this.form.patchValue({
      name: playlist?.name ?? this.library.nextDefaultName(),
      description: playlist?.description ?? '',
    });

    afterNextRender(() => {
      const input = this.nameInput()?.nativeElement;
      input?.focus();
      input?.select();
    });
  }

  async save(): Promise<void> {
    const name = this.form.controls.name.value.trim();

    if (!name) {
      this.form.controls.name.setValue('');
      this.form.controls.name.markAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      if (this.playlistUi.formMode() === 'edit') {
        await this.library.updatePlaylist(name, this.form.controls.description.value);
      } else {
        await this.library.createPlaylist(name, this.form.controls.description.value);
      }

      this.playlistUi.closeForm();
    } catch (err) {
      this.error.set(resolveApiError(err, 'No se pudo guardar la lista.'));
    } finally {
      this.saving.set(false);
    }
  }

  close(): void {
    if (this.saving()) {
      return;
    }

    this.playlistUi.closeForm();
  }
}
