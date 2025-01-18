import React, { useState } from 'react';
import styles from '../styles/Slideshow.module.css';

interface SlideShowProps {
  images?: { src: string; alt: string }[];
  media_url: string;
}

export const Slideshow: React.FC<SlideShowProps> = ({ images, media_url }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentImageIndex];
  if (!currentImage || !currentImage.src) {
    return null;
  }

  const imageSrc = currentImage.src.startsWith('http') 
    ? currentImage.src 
    : `${media_url}/${currentImage.src}`;

  const handleClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div 
        className={`${styles.slideshow} ${isZoomed ? styles.zoomed : ''}`}
        onClick={handleClick}
      >
        <img 
          src={imageSrc} 
          alt={currentImage.alt || ''} 
          className={styles.image}
        />
        {images.length > 1 && (
          <>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={handlePrev}
            >
              ‹
            </button>
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={handleNext}
            >
              ›
            </button>
            <div className={styles.counter}>
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {isZoomed && (
        <div className={styles.overlay} onClick={handleClick}>
          <img 
            src={imageSrc} 
            alt={currentImage.alt || ''} 
            className={styles.zoomedImage}
          />
        </div>
      )}
    </>
  );
};
