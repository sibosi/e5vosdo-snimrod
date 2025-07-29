import { PossibleUserType } from '@repo/types/index';
import { useState, useEffect } from 'react';
import { useAccountId } from '../components/AuthContext';

interface UseAuthReturn {
  selfUser: PossibleUserType | null;
  isLoading: boolean;
  isError: any;
}

export const useAuth = (): UseAuthReturn => {
  const [selfUser, setSelfUser] = useState<PossibleUserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<any>(null);
  const { idToken, isLoggedIn } = useAccountId();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('https://e5vosdo.hu/api/getSelfUser', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${idToken}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        setSelfUser(data);
      } catch (error) {
        setIsError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn && idToken) {
      fetchUser();
    } else {
      setSelfUser(null);
      setIsLoading(false);
      setIsError(null);
    }
  }, []);

  return {
    selfUser,
    isLoading,
    isError,
  };
};
