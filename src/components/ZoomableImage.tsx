import React, { useState } from 'react';
import styles from '../styles/ZoomableImage.module.css';

type ZoomableImageProps = {
    src: string;
    alt?: string;
    media_url?: string;
    className?: string;
};

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
    src,
    alt = '',
    media_url,
    className = ''
}) => {
    const [isZoomed, setIsZoomed] = useState(false);

    const imageSrc = src.startsWith('http')
        ? src
        : media_url ? `${media_url}/${src}` : src;

    const handleClick = () => {
        setIsZoomed(!isZoomed);
    };

    return (
        <>
            <div
                className={`${styles.container} ${className}`}
                onClick={handleClick}
            >
                <img
                    src={imageSrc}
                    alt={alt}
                    className={styles.image}
                />
            </div>
            {isZoomed && (
                <div className={styles.overlay} onClick={handleClick}>
                    <img
                        src={imageSrc}
                        alt={alt}
                        className={styles.zoomedImage}
                    />
                </div>
            )}
        </>
    );
};
