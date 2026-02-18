import React, { createContext, useContext } from "react";

export type ConfettiContextValue = {
  /** Call this to trigger a confetti burst (e.g. premium unlock, quiz 10/10). */
  triggerConfetti: () => void;
};

const ConfettiContext = createContext<ConfettiContextValue | null>(null);

export function ConfettiProvider({
  children,
  triggerConfetti,
}: {
  children: React.ReactNode;
  triggerConfetti: () => void;
}) {
  const value = React.useMemo(() => ({ triggerConfetti }), [triggerConfetti]);
  return (
    <ConfettiContext.Provider value={value}>
      {children}
    </ConfettiContext.Provider>
  );
}

export function useConfetti(): ConfettiContextValue {
  const ctx = useContext(ConfettiContext);
  if (!ctx) {
    return { triggerConfetti: () => {} };
  }
  return ctx;
}
