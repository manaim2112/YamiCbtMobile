import React, { createContext, useContext, useState } from 'react';

export interface LockdownContextValue {
  isLockdownActive: boolean;
  setLockdownActive: (active: boolean) => void;
}

const LockdownContext = createContext<LockdownContextValue | undefined>(undefined);

interface LockdownProviderProps {
  children: React.ReactNode;
}

export function LockdownProvider({ children }: LockdownProviderProps) {
  const [isLockdownActive, setLockdownActive] = useState(false);

  return (
    <LockdownContext.Provider value={{ isLockdownActive, setLockdownActive }}>
      {children}
    </LockdownContext.Provider>
  );
}

export function useLockdown(): LockdownContextValue {
  const context = useContext(LockdownContext);
  if (context === undefined) {
    throw new Error('useLockdown must be used within a LockdownProvider');
  }
  return context;
}
