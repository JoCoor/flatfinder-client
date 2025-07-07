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
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Restaurar sessão do localStorage ao iniciar
  useEffect(() => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  console.log('🧪 Verificando localStorage:', { storedUser, storedToken });

  if (storedUser && storedToken) {
    try {
      const parsedUser = JSON.parse(storedUser);
      console.log('✅ Sessão restaurada com user:', parsedUser);
      setUser(parsedUser);
    } catch (err) {
      console.error('❌ Erro ao restaurar user do localStorage:', err);
    }
  } else {
    console.warn('⚠️ Sem user/token no localStorage');
  }
}, []);

  useEffect(() => {
    if (user) {
      console.log('🧠 Conectando WebSocket como usuário:', user._id);
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
