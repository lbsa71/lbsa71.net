import { MediaItem } from "../../types/core";

export type ImageInfo = {
  src: string;
  alt: string;
};

export type TrackInfo = {
  id: string;
  type: 'track';
  title: string;
  artist?: string;
  album?: string;
  position: number;
  media?: MediaItem[];
};
