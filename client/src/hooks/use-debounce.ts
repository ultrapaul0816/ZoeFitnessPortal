import { useState, useCallback, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): [(...args: Parameters<T>) => void, boolean] {
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsPending(true);
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        setIsPending(false);
      }, delay);
    },
    [callback, delay]
  );

  return [debouncedCallback, isPending];
}

export function useButtonDebounce(delay: number = 1000) {
  const [isDisabled, setIsDisabled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = useCallback(
    <T extends (...args: any[]) => any>(callback: T) => {
      return (...args: Parameters<T>) => {
        if (isDisabled) return;

        setIsDisabled(true);
        callback(...args);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setIsDisabled(false);
        }, delay);
      };
    },
    [isDisabled, delay]
  );

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDisabled(false);
  }, []);

  return { isDisabled, handleClick, reset };
}

export function useMutationDebounce() {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const isProcessing = useCallback(
    (id: string) => processingIds.has(id),
    [processingIds]
  );

  const startProcessing = useCallback((id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
  }, []);

  const stopProcessing = useCallback((id: string) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return { isProcessing, startProcessing, stopProcessing };
}
