/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Rotates array elements by a random offset while maintaining some original order
 * @param array The array to rotate
 * @param chunkSize Size of chunks to keep together (default: 4)
 * @returns A new rotated array
 */
export function rotateArrayInChunks<T>(array: T[], chunkSize: number = 4): T[] {
  if (!array.length) return [];
  
  // Split array into chunks
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  // Rotate chunks by random offset
  const offset = Math.floor(Math.random() * chunks.length);
  const rotated = [...chunks.slice(offset), ...chunks.slice(0, offset)];

  return rotated.flat();
} 