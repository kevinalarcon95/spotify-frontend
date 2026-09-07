import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LibraryService } from '../../../core/services/library.service';
import { resolveApiError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-song-form',
  imports: [ReactiveFormsModule],
  templateUrl: './song-form.html',
  styleUrl: './song-form.css',
})
export class SongForm {
  private readonly library = inject(LibraryService);
  private readonly fb = inject(FormBuilder);
  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    artist: ['', Validators.required],
    album: [''],
    year: [''],
    genre: [''],
  });

  constructor() {
    afterNextRender(() => this.titleInput()?.nativeElement.focus());
  }

  async save(): Promise<void> {
    const title = this.form.controls.title.value.trim();
    const artist = this.form.controls.artist.value.trim();

    if (!title || !artist) {
      this.form.patchValue({ title, artist });
      this.form.markAllAsTouched();
      return;
    }

    if (!this.library.selectedPlaylist()) {
      this.error.set('Selecciona una lista para añadir canciones.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      await this.library.addTrack({
        title,
        artist,
        album: this.form.controls.album.value.trim(),
        year: this.form.controls.year.value.trim(),
        genre: this.form.controls.genre.value.trim(),
      });

      this.form.reset({
        title: '',
        artist: '',
        album: '',
        year: '',
        genre: '',
      });
      this.titleInput()?.nativeElement.focus();
    } catch (err) {
      this.error.set(resolveApiError(err, 'No se pudo añadir la canción.'));
    } finally {
      this.saving.set(false);
    }
  }

  isInvalid(controlName: 'title' | 'artist'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }
}
