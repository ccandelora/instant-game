// Create audio elements for our sound effects
const createSoundEffect = (url) => {
  const audio = new Audio(url);
  audio.volume = 0.3; // Set default volume
  return audio;
};

export const sounds = {
  hover: createSoundEffect('https://cdn.freesound.org/previews/320/320181_5260872-lq.mp3'),
  click: createSoundEffect('https://cdn.freesound.org/previews/404/404754_140737-lq.mp3')
};

// Prevent sounds from playing simultaneously
let lastPlayedTime = 0;
const DEBOUNCE_TIME = 100; // ms

export const playSound = (sound) => {
  const now = Date.now();
  if (now - lastPlayedTime > DEBOUNCE_TIME) {
    sound.currentTime = 0;
    sound.play().catch(err => console.log('Audio play failed:', err));
    lastPlayedTime = now;
  }
}; 