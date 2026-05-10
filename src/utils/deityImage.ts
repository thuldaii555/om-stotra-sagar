import type { Deity, ImageCrop } from '../types';
import type { CSSProperties } from 'react';

export const DEFAULT_IMAGE_CROP: ImageCrop = { x: 0, y: 0, scale: 1 };

export function getDeityImageSrc(deity: Pick<Deity, 'imageUrl' | 'imageDataUrl' | 'imageSrc'>): string {
  return deity.imageUrl || deity.imageDataUrl || deity.imageSrc || '';
}

export function getDeityImageCrop(deity: Pick<Deity, 'imageCrop' | 'imagePositionX' | 'imagePositionY' | 'imageScale'>): ImageCrop {
  if (deity.imageCrop) return deity.imageCrop;
  return {
    x: typeof deity.imagePositionX === 'number' ? deity.imagePositionX - 50 : DEFAULT_IMAGE_CROP.x,
    y: typeof deity.imagePositionY === 'number' ? deity.imagePositionY - 50 : DEFAULT_IMAGE_CROP.y,
    scale: typeof deity.imageScale === 'number' ? deity.imageScale : DEFAULT_IMAGE_CROP.scale,
  };
}

export function getDeityImageStyle(deity: Pick<Deity, 'imageCrop' | 'imagePositionX' | 'imagePositionY' | 'imageScale'>): CSSProperties {
  const crop = getDeityImageCrop(deity);
  return {
    transform: `translate(${crop.x}%, ${crop.y}%) scale(${crop.scale})`,
  };
}
