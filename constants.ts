export const COLORS = {
  GREEN_LIGHT: '#A2D5AB', // Pale/Light Green (80%)
  GREEN_MID: '#5C9E6F',   // Medium Green (10%)
  GREEN_DARK: '#3A6B4A',  // Deep Forest Green (10%)
  METALLIC_GOLD: '#FFC857', // Richer Gold
  CHRISTMAS_RED: '#D90429', // Vibrant Red
  WHITE: '#FFFFFF',
  WARM_LIGHT: '#FFB700',
};

export const CONFIG = {
  PARTICLE_COUNT: 500, // High count for density
  TREE_HEIGHT: 14,
  TREE_RADIUS_BASE: 5,
  SCATTER_RADIUS: 28, // Slightly wider scatter for dreaminess
  CAMERA_Z_TREE: 20,
  CAMERA_Z_SCATTER: 15,
};

// --- IMAGE CONFIGURATION ---
// Default: Reliable placeholder images (Placehold.co) to prevent loading errors
//export const BACKGROUND_IMAGES = [
//  'https://placehold.co/600x600/5C9E6F/FFFFFF/png?text=Memory+1',
  //'https://placehold.co/600x600/A2D5AB/050505/png?text=Memory+2',
  //'https://placehold.co/600x600/D90429/FFFFFF/png?text=Memory+3',
  //'https://placehold.co/600x600/FFC857/050505/png?text=Memory+4',
  //'https://placehold.co/600x600/3A6B4A/FFFFFF/png?text=Memory+5',
  //'https://placehold.co/600x600/FFB700/050505/png?text=Memory+6',
  //'https://placehold.co/600x600/050505/FFFFFF/png?text=Memory+7',
  //'https://placehold.co/600x600/D90429/FFC857/png?text=Memory+8',
//];

// HOW TO USE LOCAL PHOTOS:
// 1. Put your images in the /public/photos/ folder (create it if it doesn't exist).
// 2. Name them 1.jpg, 2.jpg, ... 12.jpg.
// 3. Uncomment the line below and comment out the list above.
export const BACKGROUND_IMAGES = Array.from({ length: 12 }, (_, i) => `/photos/${i + 1}.jpg`);