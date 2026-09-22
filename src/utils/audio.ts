export const playAudio = (textOrUrl: string, isUrl: boolean = false) => {
  if (isUrl && textOrUrl) {
    const audio = new Audio(textOrUrl);
    audio.play().catch(e => console.error("Audio playback failed:", e));
    return;
  }
  
  if ('speechSynthesis' in window) {
    // Stop any currently playing audio
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textOrUrl);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Légèrement ralenti pour l'apprentissage
    window.speechSynthesis.speak(utterance);
  }
};
