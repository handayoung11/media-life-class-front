import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

export interface UserInfo {
  id: number;
  nickname: string;
  profile: string | null;
  mediaGoal: number;
  createdAt: string;
}

interface UserContextValue {
  user: UserInfo | null;
  loading: boolean;
  refresh: () => Promise<void>;
  clear: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: false,
  refresh: async () => {},
  clear: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      setLoading(true);
      const res = await api.get<UserInfo>('/user/me');
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => setUser(null);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refresh, clear }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export function profileImageUrl(profile: string | null): string | null {
  if (!profile) return null;
  if (profile.startsWith('http')) return profile;
  return `${api.defaults.baseURL}/${profile}`;
}
