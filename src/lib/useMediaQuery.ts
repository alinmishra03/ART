import { useSyncExternalStore } from "react";
import { MQ } from "./motion";

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery(MQ.reduce);
export const useFinePointer = () => useMediaQuery(MQ.fine);
