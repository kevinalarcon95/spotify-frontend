export interface Track {
  title: string;
  artist: string;
  album: string;
  year: string;
  genre: string;
}

export interface TrackApi {
  titulo: string;
  artista: string;
  album?: string;
  anno?: string;
  genero?: string;
}

export function mapTrack(api: TrackApi): Track {
  return {
    title: api.titulo,
    artist: api.artista,
    album: api.album ?? '',
    year: api.anno ?? '',
    genre: api.genero ?? '',
  };
}

export function mapTrackToApi(track: Track): TrackApi {
  return {
    titulo: track.title,
    artista: track.artist,
    album: track.album,
    anno: track.year,
    genero: track.genre,
  };
}
