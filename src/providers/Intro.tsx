import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Preloader } from "../components/layout/Preloader";

interface IntroValue {
  /** True once the preloader starts lifting; gate hero entrance animations on it. */
  ready: boolean;
}

const IntroContext = createContext<IntroValue>({ ready: true });

export function IntroProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const reveal = useCallback(() => setReady(true), []);

  return (
    <IntroContext.Provider value={{ ready }}>
      {children}
      <Preloader onReveal={reveal} />
    </IntroContext.Provider>
  );
}

export const useIntro = () => useContext(IntroContext);
