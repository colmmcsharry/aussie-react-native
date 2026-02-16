import React, { createContext, useContext } from 'react';

type PaywallContextValue = {
  openPaywall: () => void;
};

const PaywallContext = createContext<PaywallContextValue | null>(null);

export function PaywallProvider({
  children,
  openPaywall,
}: {
  children: React.ReactNode;
  openPaywall: () => void;
}) {
  const value = React.useMemo(
    () => ({ openPaywall }),
    [openPaywall]
  );
  return (
    <PaywallContext.Provider value={value}>
      {children}
    </PaywallContext.Provider>
  );
}

export function usePaywall(): PaywallContextValue {
  const ctx = useContext(PaywallContext);
  if (!ctx) {
    return {
      openPaywall: () => {},
    };
  }
  return ctx;
}
