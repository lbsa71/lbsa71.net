import { useState, useEffect } from 'react';
import { parseMarkdown } from '../../lib/markdownParser';
import { useRouter } from 'next/router';
import { ContentDocument, TrackNode } from '../../types/core';

type UseTrackManagementProps = {
  content: string;
  documentId: string;
  playListItems: ContentDocument[];
  duration: number;
  currentTime: number;
};

type UseTrackManagementResult = {
  tracks: TrackNode[];
  currentTrackIndex: number;
  currentTrack: TrackNode | null;
  onAudioEnd: () => void;
  onTrackChange: (index: number) => void;
};

export const useTrackManagement = ({
  content,
  documentId,
  playListItems,
  duration,
  currentTime,
}: UseTrackManagementProps): UseTrackManagementResult => {
  const router = useRouter();
  const { tracks } = parseMarkdown(content);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    const track = parseInt(router.query.track as string);
    if (!isNaN(track) && track >= 0 && track < tracks.length) {
      setCurrentTrackIndex(track);
    }
  }, [router.query.track, tracks.length]);

  const onAudioEnd = () => {
    if (currentTrackIndex < tracks.length - 1) {
      const nextTrack = currentTrackIndex + 1;
      router.push({
        pathname: router.pathname,
        query: { ...router.query, track: nextTrack },
      });
      setCurrentTrackIndex(nextTrack);
    }
  };

  const onTrackChange = (index: number) => {
    if (index >= 0 && index < tracks.length) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, track: index },
      });
      setCurrentTrackIndex(index);
    }
  };

  return {
    tracks,
    currentTrackIndex,
    currentTrack: tracks[currentTrackIndex] || null,
    onAudioEnd,
    onTrackChange,
  };
};
