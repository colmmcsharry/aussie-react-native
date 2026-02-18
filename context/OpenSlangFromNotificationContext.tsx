import React, { createContext, useCallback, useContext, useState } from "react";

type OpenSlangFromNotificationContextValue = {
  openSlangOnNextFeedFocus: boolean;
  setOpenSlangOnNextFeedFocus: (value: boolean) => void;
  consumeOpenSlang: () => boolean;
};

const OpenSlangFromNotificationContext =
  createContext<OpenSlangFromNotificationContextValue | null>(null);

export function OpenSlangFromNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openSlangOnNextFeedFocus, setOpenSlangOnNextFeedFocus] = useState(false);

  const consumeOpenSlang = useCallback(() => {
    if (!openSlangOnNextFeedFocus) return false;
    setOpenSlangOnNextFeedFocus(false);
    return true;
  }, [openSlangOnNextFeedFocus]);

  const value = React.useMemo(
    () => ({
      openSlangOnNextFeedFocus,
      setOpenSlangOnNextFeedFocus,
      consumeOpenSlang,
    }),
    [openSlangOnNextFeedFocus, consumeOpenSlang]
  );

  return (
    <OpenSlangFromNotificationContext.Provider value={value}>
      {children}
    </OpenSlangFromNotificationContext.Provider>
  );
}

export function useOpenSlangFromNotification(): OpenSlangFromNotificationContextValue {
  const ctx = useContext(OpenSlangFromNotificationContext);
  if (!ctx) {
    return {
      openSlangOnNextFeedFocus: false,
      setOpenSlangOnNextFeedFocus: () => {},
      consumeOpenSlang: () => false,
    };
  }
  return ctx;
}
