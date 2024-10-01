import { useContext, createContext, type PropsWithChildren } from 'react';
import { useAppStore } from '~/lib/state/appStore';

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  hasSession: boolean;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  hasSession: false,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const appStore = useAppStore();
  const isSecurityEnabled = useAppStore(x => x.isSecurityEnabled);
  const unlocked = useAppStore(x => x.unlocked)

  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          appStore.setUnlocked(true);
        },
        signOut: () => {
          appStore.setUnlocked(false);
        },
        hasSession: (!isSecurityEnabled || (isSecurityEnabled && unlocked)),
        isLoading: false,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
