import React, { createContext, useContext } from 'react';

export type PaywallContextValue = {
  openPaywall: () => void;
  isPremium: boolean;
  refreshPremiumState: () => Promise<void>;
};

const PaywallContext = createContext<PaywallContextValue | null>(null);

export function PaywallProvider({
  children,
  openPaywall,
  isPremium,
  refreshPremiumState,
}: {
  children: React.ReactNode;
  openPaywall: () => void;
  isPremium: boolean;
  refreshPremiumState: () => Promise<void>;
}) {
  const value = React.useMemo(
    () => ({ openPaywall, isPremium, refreshPremiumState }),
    [openPaywall, isPremium, refreshPremiumState]
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
      isPremium: false,
      refreshPremiumState: async () => {},
    };
  }
  return ctx;
}
