// Générer un émoji déterministe basé sur le mot si aucune image n'est fournie
export const getEmojiForWord = (word: string) => {
  const emojis = ["🍎", "🏀", "🎸", "🦊", "🌍", "🚀", "🌟", "💡", "🎯", "🎨", "🧩", "🍕", "📚", "⌚", "💻", "☕"];
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash);
  }
  return emojis[Math.abs(hash) % emojis.length];
};
