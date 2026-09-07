import { mapTrack, mapTrackToApi, Track, TrackApi } from './track.model';

export interface Playlist {
  name: string;
  description: string;
  tracks: Track[];
}

export interface PlaylistApi {
  nombre: string;
  descripcion?: string;
  canciones?: TrackApi[];
}

export function mapPlaylist(api: PlaylistApi): Playlist {
  return {
    name: api.nombre,
    description: api.descripcion ?? '',
    tracks: (api.canciones ?? []).map(mapTrack),
  };
}

export function mapPlaylistToApi(playlist: Playlist): PlaylistApi {
  return {
    nombre: playlist.name,
    descripcion: playlist.description,
    canciones: playlist.tracks.map(mapTrackToApi),
  };
}
