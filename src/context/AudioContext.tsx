import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AudioContextType = {
  currentTime: number;
  duration: number;
  cuePoints: number[];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  setCuePoints: (points: number[]) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

type AudioProviderProps = {
  children: ReactNode;
  src: string;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children, src }: AudioProviderProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cuePoints, setCuePoints] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      void audioRef.current.play();
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  };

  const handleSetVolume = (newVolume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <AudioContext.Provider 
      value={{ 
        currentTime, 
        duration, 
        cuePoints, 
        isPlaying,
        volume,
        isMuted,
        setCuePoints,
        togglePlay,
        seek,
        setVolume: handleSetVolume,
        toggleMute,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
