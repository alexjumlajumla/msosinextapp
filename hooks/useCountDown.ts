import { useEffect, useRef, useState } from 'react';

export const useCountDown: (
  total: number,
  ms?: number,
) => [number, () => void, () => void, () => void] = (
  total: number,
  ms: number = 1000,
) => {
  const [counter, setCountDown] = useState(total);
  const [startCountDown, setStartCountDown] = useState(false);
  const intervalId = useRef<NodeJS.Timer>();

  const start: () => void = () => setStartCountDown(true);
  const pause: () => void = () => setStartCountDown(false);
  const reset: () => void = () => {
    clearInterval(intervalId.current);
    setStartCountDown(false);
    setCountDown(total);
  };

  useEffect(() => {
    if (!startCountDown) return; // Early exit if not counting down

    intervalId.current = setInterval(() => {
      setCountDown(prevCounter => {
        if (prevCounter <= 1) {
          clearInterval(intervalId.current); // Clear interval when reaching 0
          return 0; // Prevent going below 0
        }
        return prevCounter - 1; // Decrement counter
      });
    }, ms);

    return () => clearInterval(intervalId.current); // Cleanup on unmount or dependency change
  }, [startCountDown, ms]); // Removed counter from dependencies

  return [counter, start, pause, reset];
};
