export enum AppMode {
  TREE = 'TREE',
  SCATTER = 'SCATTER',
  ZOOM = 'ZOOM'
}

export enum HandGesture {
  NONE = 'NONE',
  OPEN_PALM = 'OPEN_PALM',
  CLOSED_FIST = 'CLOSED_FIST',
  PINCH = 'PINCH',
  POINTING = 'POINTING'
}

export interface ParticleData {
  id: string;
  type: 'SPHERE' | 'CUBE' | 'CANDY_CANE' | 'PHOTO';
  color: string;
  positionTree: [number, number, number];
  positionScatter: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  imageUrl?: string;
}

export interface HandData {
  gesture: HandGesture;
  position: { x: number; y: number }; // Normalized 0-1
  tilt: number; // Rotation of the hand
}