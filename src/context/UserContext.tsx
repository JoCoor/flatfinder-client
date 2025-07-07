import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
};

const defaultContext: UserContextType = {
  user: null,
  setUser: () => {},
  unreadCount: 0,
  setUnreadCount: () => {},
};

export const UserContext = createContext<UserContextType>(defaultContext);

const socket = io('http://localhost:5000');

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      socket.emit('join-user', user._id);

      socket.on('nova-mensagem', (data) => {
        if (data?.flatId && data?.senderId !== user._id) {
          setUnreadCount((prev) => prev + 1);
        }
      });
    }

    return () => {
      socket.off('nova-mensagem');
    };
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, unreadCount, setUnreadCount }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
