export const playAudio = (text: string) => {
  if ('speechSynthesis' in window) {
    // Stop any currently playing audio
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Légèrement ralenti pour l'apprentissage
    window.speechSynthesis.speak(utterance);
  }
};
