import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

export const loadFont = () => {
  return new Promise((resolve, reject) => {
    const loader = new FontLoader();
    loader.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      (font) => resolve(font),
      undefined,
      (error) => reject(error)
    );
  });
}; 