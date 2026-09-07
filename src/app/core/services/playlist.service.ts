import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { mapPlaylist, mapPlaylistToApi, Playlist, PlaylistApi } from '../../shared/models/playlist.model';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/lists`;

  getAll(): Observable<Playlist[]> {
    return this.http
      .get<PlaylistApi[]>(this.url)
      .pipe(map((list) => (list ?? []).map(mapPlaylist)));
  }

  getByName(name: string): Observable<Playlist> {
    return this.http.get<PlaylistApi>(this.path(name)).pipe(map(mapPlaylist));
  }

  create(playlist: Playlist): Observable<Playlist> {
    return this.http.post<PlaylistApi>(this.url, mapPlaylistToApi(playlist)).pipe(map(mapPlaylist));
  }

  delete(name: string): Observable<void> {
    return this.http.delete<void>(this.path(name));
  }

  private path(name: string): string {
    return `${this.url}/${encodeURIComponent(name)}`;
  }
}
