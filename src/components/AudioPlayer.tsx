import React, { useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import styles from '../styles/AudioPlayer.module.css';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaStepBackward, FaStepForward } from 'react-icons/fa';

interface AudioPlayerProps {
  onTrackChange?: (index: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ onTrackChange }) => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    cuePoints,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  } = useAudio();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentCuePointIndex = () => {
    // Find the last cue point that's less than or equal to the current time
    const index = cuePoints.reduce((lastIndex, point, currentIndex) => {
      if (point <= currentTime) {
        return currentIndex;
      }
      return lastIndex;
    }, 0);
    return index;
  };

  const handlePrev = () => {
    const currentIndex = getCurrentCuePointIndex();
    if (currentIndex > 0) {
      seek(cuePoints[currentIndex - 1]);
      onTrackChange && onTrackChange(currentIndex - 1);
    } else {
      seek(0);
      onTrackChange && onTrackChange(0);
    }
  };

  const handleNext = () => {
    const currentIndex = getCurrentCuePointIndex();
    if (currentIndex < cuePoints.length - 1) {
      seek(cuePoints[currentIndex + 1]);
      onTrackChange && onTrackChange(currentIndex + 1);
    } else if (duration > 0) {
      seek(duration);
    }
  };

  useEffect(() => {
    const currentIndex = getCurrentCuePointIndex();
    onTrackChange && onTrackChange(currentIndex);
  }, [currentTime, cuePoints, onTrackChange]);

  const isFirstCuePoint = currentTime === 0 || (cuePoints.length > 0 && currentTime <= cuePoints[0]);
  const isLastCuePoint = cuePoints.length > 0 && currentTime >= cuePoints[cuePoints.length - 1];

  const validCuePoints = cuePoints.length > 0 && cuePoints.every(point => point >= 0 && point <= duration);

  return (
    <div className={styles.audioPlayer}>
      <div className={styles.controls}>
        {validCuePoints && (
          <button
            onClick={handlePrev}
            className={`${styles.navButton} ${isFirstCuePoint ? styles.disabled : ''}`}
            disabled={isFirstCuePoint}
            aria-label="Previous track"
          >
            <FaStepBackward />
          </button>
        )}
        <button onClick={togglePlay} className={styles.playPauseButton} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        {validCuePoints && (
          <button
            onClick={handleNext}
            className={`${styles.navButton} ${isLastCuePoint ? styles.disabled : ''}`}
            disabled={isLastCuePoint}
            aria-label="Next track"
          >
            <FaStepForward />
          </button>
        )}
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => {
            const newTime = parseFloat(e.target.value);
            seek(newTime);
            const newIndex = getCurrentCuePointIndex();
            onTrackChange && onTrackChange(newIndex);
          }}
          className={styles.seekBar}
          aria-label="Seek"
        />
        <div className={styles.timeDisplay}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className={styles.volumeControl}>
          <button onClick={toggleMute} className={styles.muteButton} aria-label={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className={styles.volumeSlider}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
