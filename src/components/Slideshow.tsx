import { useState } from "react";
import styles from "../styles/Slideshow.module.css";
import { MediaItem } from "../types/core";

type SlideshowProps = {
  images: MediaItem[];
  media_url: string;
};

export const Slideshow = ({ images, media_url }: SlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const imageUrl = currentImage.url.startsWith("http") 
    ? currentImage.url 
    : `${media_url}/${currentImage.url}`;

  return (
    <div className={styles.slideshow}>
      <img
        src={imageUrl}
        alt={currentImage.alt || ""}
        className={styles.image}
        onClick={toggleZoom}
      />
      {images.length > 1 && (
        <>
          <button
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={handlePrevClick}
          >
            ‹
          </button>
          <button
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={handleNextClick}
          >
            ›
          </button>
          <div className={styles.counter}>
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
      {isZoomed && (
        <div className={styles.overlay} onClick={toggleZoom}>
          <img
            src={imageUrl}
            alt={currentImage.alt || ""}
            className={styles.zoomedImage}
          />
        </div>
      )}
    </div>
  );
};
