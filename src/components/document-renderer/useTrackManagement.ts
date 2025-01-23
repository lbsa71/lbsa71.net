import { useState, useEffect } from 'react';
import { parseMarkdown } from '../../lib/markdownParser';
import { TrackInfo } from './types';
import { useRouter } from 'next/router';
import { ContentDocument } from '../../lib/getSite';

type UseTrackManagementProps = {
  content: string;
  document_id: string;
  playListItems: ContentDocument[];
  duration: number;
  currentTime: number;
};

type UseTrackManagementResult = {
  tracks: TrackInfo[];
  currentTrackIndex: number;
  currentTrack: TrackInfo | null;
  onAudioEnd: () => void;
  onTrackChange: (index: number) => void;
};

export const useTrackManagement = ({
  content,
  document_id,
  playListItems,
  duration,
  currentTime,
}: UseTrackManagementProps): UseTrackManagementResult => {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);

  useEffect(() => {
    const { tracks: parsedTracks } = parseMarkdown(content);
    const newTracks = parsedTracks.map(track => ({
      title: track.title,
      artist: track.artist,
      album: track.album,
      position: track.position,
      images: track.images?.map(img => ({
        src: img.src,
        alt: img.alt
      }))
    }));
    setTracks(newTracks);
  }, [content]);

  useEffect(() => {
    if (tracks.length === 0 || duration <= 0) return;

    const newIndex = tracks.reduce((lastIndex, track, currentIndex) => 
      track.position <= currentTime ? currentIndex : lastIndex, 0);

    if (newIndex !== currentTrackIndex) {
      setCurrentTrackIndex(newIndex);
    }
  }, [currentTime, duration, tracks, currentTrackIndex]);

  const onAudioEnd = () => {
    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < tracks.length) {
      setCurrentTrackIndex(nextIndex);
      return;
    }

    const currentDocIndex = playListItems.findIndex(
      (item) => item.document_id === document_id
    );
    const nextDocIndex = currentDocIndex + 1;

    if (nextDocIndex < playListItems.length) {
      const nextItem = playListItems[nextDocIndex];
      void router.push(`/read/${nextItem.document_id}?play`);
    }
  };

  const onTrackChange = (index: number) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentTrackIndex(index);
    }
  };

  return {
    tracks,
    currentTrackIndex,
    currentTrack: currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null,
    onAudioEnd,
    onTrackChange,
  };
};
