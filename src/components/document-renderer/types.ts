export interface TrackInfo {
  title: string;
  artist: string;
  album?: string;
  position: number;
  images?: { src: string; alt: string }[];
}
