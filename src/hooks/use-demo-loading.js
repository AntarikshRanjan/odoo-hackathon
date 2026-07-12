import { useEffect, useState } from "react";

const visitedPages = new Set();

export function useDemoLoading(key, delay = 450) {
  const [loading, setLoading] = useState(() => !visitedPages.has(key));

  useEffect(() => {
    if (visitedPages.has(key)) return undefined;

    const timer = window.setTimeout(() => {
      visitedPages.add(key);
      setLoading(false);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay, key]);

  return loading;
}

