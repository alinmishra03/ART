import { useCallback, useState } from "react";

/**
 * A best score kept in this browser (localStorage), guarded for private
 * modes and blocked storage. `better(a, b)` says whether a beats b; pass a
 * stable (module-level) function. `submit` returns true for a new record.
 */
export function useBest(key: string, better: (a: number, b: number) => boolean) {
  const [best, setBest] = useState<number | null>(() => {
    try {
      const v = localStorage.getItem(key);
      return v === null ? null : Number(v);
    } catch {
      return null;
    }
  });

  const submit = useCallback(
    (score: number) => {
      const record = best === null || better(score, best);
      if (!record) return false;
      setBest(score);
      try {
        localStorage.setItem(key, String(score));
      } catch {
        /* storage unavailable: the best score lasts for this visit */
      }
      return true;
    },
    [best, key, better],
  );

  return { best, submit };
}
