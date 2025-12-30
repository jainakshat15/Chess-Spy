export const generateRandomName = (): string => {
  const adjectives = ['Swift', 'Bold', 'Clever', 'Noble', 'Brave', 'Wise', 'Fierce', 'Calm'];
  const nouns = ['Knight', 'Rook', 'Bishop', 'Pawn', 'King', 'Queen', 'Player', 'Master'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  
  return `${adjective}${noun}${number}`;
};

