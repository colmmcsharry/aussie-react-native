import React, { createContext, useContext } from 'react';

export type PaywallContextValue = {
  openPaywall: () => void;
  isPremium: boolean;
  refreshPremiumState: () => Promise<void>;
  /** Show the "You are on Premium, thanks!" modal (used when tapping the header tick). */
  openPremiumThanksModal: () => void;
};

const PaywallContext = createContext<PaywallContextValue | null>(null);

export function PaywallProvider({
  children,
  openPaywall,
  isPremium,
  refreshPremiumState,
  openPremiumThanksModal,
}: {
  children: React.ReactNode;
  openPaywall: () => void;
  isPremium: boolean;
  refreshPremiumState: () => Promise<void>;
  openPremiumThanksModal: () => void;
}) {
  const value = React.useMemo(
    () => ({ openPaywall, isPremium, refreshPremiumState, openPremiumThanksModal }),
    [openPaywall, isPremium, refreshPremiumState, openPremiumThanksModal]
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
      openPremiumThanksModal: () => {},
    };
  }
  return ctx;
}
