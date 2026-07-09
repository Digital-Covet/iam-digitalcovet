import { createContext, useContext, type JSX } from "solid-js";

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  image: string | undefined;
}

interface AuthContextValue {
  user: () => AuthUser | null;
  isLoaded: () => boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: () => null,
  isLoaded: () => false,
});

export function AuthProvider(props: { value: AuthContextValue; children: JSX.Element }) {
  return <AuthContext.Provider value={props.value}>{props.children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
