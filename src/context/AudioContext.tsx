import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  cuePoints: number[];
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setAudioSrc: (src: string) => void;
  setCuePoints: (points: number[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<React.PropsWithChildren<{ src?: string }>> = ({ children, src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [cuePoints, setCuePoints] = useState<number[]>([]);

  const setAudioSrc = useCallback((newSrc: string) => {
    if (audioRef.current) {
      audioRef.current.src = newSrc;
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setCuePoints([]);
    }
  }, []);

  useEffect(() => {
    if (src) {
      setAudioSrc(src);
    }
  }, [setAudioSrc, src]);

  const play = useCallback(() => {
    audioRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current && isFinite(time) && time >= 0 && time <= audioRef.current.duration) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setAudioVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const setCuePointsCallback = useCallback((points: number[]) => {
    setCuePoints(points);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => {
      setDuration(audio.duration);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    // Add a more frequent update for currentTime
    const updateInterval = setInterval(() => {
      setCurrentTime(audio.currentTime);
    }, 100); // Update every 100ms

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      clearInterval(updateInterval);
    };
  }, []);

  const value = {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    cuePoints,
    play,
    pause,
    togglePlay,
    seek,
    setVolume: setAudioVolume,
    toggleMute,
    setAudioSrc,
    setCuePoints: setCuePointsCallback,
  };

  return (
    <AudioContext.Provider value={value}>
      <audio ref={audioRef} />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
