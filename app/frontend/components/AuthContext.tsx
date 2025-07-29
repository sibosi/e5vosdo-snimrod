import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';

type UserInfo = {
  name: string;
  email: string;
  picture: string;
};

type AuthContextType = {
  // User state
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;

  // Token state
  idToken: string | null;
  setIdToken: (token: string | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;

  // Auth status
  isLoggedIn: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Actions
  login: (userInfo: UserInfo, idToken: string, accessToken: string) => void;
  logout: () => void;

  // Refresh trigger for components that need to re-fetch data
  refreshTrigger: number;
  triggerRefresh: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isLoggedIn = !!(userInfo && idToken);

  const login = useCallback(
    (userInfo: UserInfo, idToken: string, accessToken: string) => {
      setUserInfo(userInfo);
      setIdToken(idToken);
      setAccessToken(accessToken);
      setRefreshTrigger((prev) => prev + 1);
    },
    []
  );

  const logout = useCallback(() => {
    setUserInfo(null);
    setIdToken(null);
    setAccessToken(null);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      userInfo,
      setUserInfo,
      idToken,
      setIdToken,
      accessToken,
      setAccessToken,
      isLoggedIn,
      isLoading,
      setIsLoading,
      login,
      logout,
      refreshTrigger,
      triggerRefresh,
    }),
    [
      userInfo,
      idToken,
      accessToken,
      isLoggedIn,
      isLoading,
      login,
      logout,
      refreshTrigger,
      triggerRefresh,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAccountId = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAccountId must be used within an AuthProvider');
  }
  return context;
};
