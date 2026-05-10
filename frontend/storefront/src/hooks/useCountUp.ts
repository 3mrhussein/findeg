import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for animating a number from 0 to a specified end value.
 *
 * This hook uses `requestAnimationFrame` for smooth animation.
 *
 * @param {number} endValue - The final value to count up to.
 * @param {number} [duration=2000] - The duration of the animation in milliseconds.
 * @returns {number} The current animated value.
 */
export const useCountUp = (endValue: number, duration: number = 2000): number => {
  const [count, setCount] = useState(0);
  // FIX: Pass undefined as the initial value to useRef to resolve the "Expected 1 arguments, but got 0" error.
  const requestRef = useRef<number | undefined>(undefined);
  // FIX: Pass undefined as the initial value to useRef to resolve the "Expected 1 arguments, but got 0" error.
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    /**
     *
     */
    const animate = (timestamp: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = timestamp;
      }
      const elapsedTime = timestamp - (startTimeRef.current ?? 0);
      const progress = Math.min(elapsedTime / duration, 1);

      // Ease-out function
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentVal = easedProgress * endValue;
      setCount(currentVal);

      if (elapsedTime < duration) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = undefined; // Reset start time on each new animation
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [endValue, duration]);

  return count;
};
