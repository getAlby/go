import { createContext, useContext, type PropsWithChildren } from "react";
import { useAppStore } from "~/lib/state/appStore";

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  hasSession: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  hasSession: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const appStore = useAppStore();
  const isSecurityEnabled = useAppStore((store) => store.isSecurityEnabled);
  const unlocked = useAppStore((store) => store.unlocked);

  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          appStore.setUnlocked(true);
        },
        signOut: () => {
          appStore.setUnlocked(false);
        },
        hasSession: !isSecurityEnabled || (isSecurityEnabled && unlocked),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
