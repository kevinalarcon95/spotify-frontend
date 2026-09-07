import { Track } from './track.model';

export interface Playlist {
  name: string;
  description: string;
  tracks: Track[];
}
