export type ImageInfo = {
  src: string;
  alt: string;
};

export type TrackInfo = {
  title: string;
  artist: string;
  album?: string;
  position: number;
  images?: ImageInfo[];
};
