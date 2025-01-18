import { useState, useEffect } from 'react';
import { parseMarkdown } from '../../lib/markdownParser';
import { TrackInfo } from '../document-renderer/types';
import { useRouter } from 'next/router';
import { ContentDocument } from '../../lib/getSite';

interface UseTrackManagementProps {
  content: string;
  document_id: string;
  playListItems: ContentDocument[];
  duration: number;
  currentTime: number;
}

export const useTrackManagement = ({
  content,
  document_id,
  playListItems,
  duration,
  currentTime,
}: UseTrackManagementProps) => {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);

  useEffect(() => {
    const parsed = parseMarkdown(content);
    const newTracks = parsed.tracks.map(track => ({
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
    if (tracks.length > 0 && duration > 0) {
      // Find the last track whose position is less than or equal to the current time
      const newIndex = tracks.reduce((lastIndex, track, currentIndex) => {
        if (track.position <= currentTime) {
          return currentIndex;
        }
        return lastIndex;
      }, 0);

      if (newIndex !== currentTrackIndex) {
        setCurrentTrackIndex(newIndex);
      }
    }
  }, [currentTime, duration, tracks, currentTrackIndex]);

  const onAudioEnd = () => {
    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < tracks.length) {
      setCurrentTrackIndex(nextIndex);
    } else {
      const currentDocIndex = playListItems.findIndex((item) => item.document_id === document_id);
      const nextDocIndex = currentDocIndex + 1;
      if (nextDocIndex < playListItems.length) {
        const nextItem = playListItems[nextDocIndex];
        const nextUrl = `/read/${nextItem.document_id}?play`;
        router.push(nextUrl);
      }
    }
  };

  const onTrackChange = (index: number) => {
    setCurrentTrackIndex(index);
  };

  return {
    tracks,
    currentTrackIndex,
    currentTrack: currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null,
    onAudioEnd,
    onTrackChange,
  };
};
