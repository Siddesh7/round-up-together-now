import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useIntMax, UseIntMaxReturnType } from "@/hooks/use-intmax";

const IntMaxContext = createContext<UseIntMaxReturnType | undefined>(undefined);

export const IntMaxProvider = ({ children }: { children: ReactNode }) => {
  const intmax = useIntMax();

  useEffect(() => {
    if (!intmax.client && !intmax.loading) {
      intmax.initializeClient();
    }
  }, [intmax.client, intmax.loading, intmax.initializeClient]);

  return (
    <IntMaxContext.Provider value={intmax}>{children}</IntMaxContext.Provider>
  );
};

export const useIntMaxContext = () => {
  const context = useContext(IntMaxContext);
  if (context === undefined) {
    throw new Error("useIntMaxContext must be used within an IntMaxProvider");
  }
  return context;
};
