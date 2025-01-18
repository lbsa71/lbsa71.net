import React, { useRef, useState, useEffect, useCallback } from 'react';

interface AudioSourceProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

const AudioSource: React.FC<AudioSourceProps> = ({
  src,
  onTimeUpdate,
  onDurationChange,
  onEnded,
  onPlay,
  onPause,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => onTimeUpdate?.(audio.currentTime);
    const handleDurationChange = () => onDurationChange?.(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate, onDurationChange, onEnded, onPlay, onPause]);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  return (
    <audio ref={audioRef} src={src} />
  );
};

export default AudioSource;
