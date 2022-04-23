import { createContext, ReactNode, useEffect, useState } from 'react';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import Router from 'next/router';
import { api } from '../services/apiClient';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredenntials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredenntials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode; // Qlqr coisa: componentes, textos, numeros, etc
};

type AuthResponse = {
  permissions: string[];
  roles: string[];
  token: string;
  refreshToken: string;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  authChannel.postMessage('signOut');

  Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth');

    authChannel.onmessage = message => {
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
        // case 'signIn':
        //   Router.push('/dashboard');
        //   break;
        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();
    if (token) {
      api
        .get('/me')
        .then(response => {
          const { data } = response;
          setUser(data);
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredenntials) {
    try {
      const response = await api.post<AuthResponse>('sessions', {
        email,
        password,
      });

      const { permissions, roles, refreshToken, token } = response.data;
      // estrategias de segurança
      // sessionStorage: armazena dados do usuario enquanto o navegador ou aba estiver aberto
      // localStorage: armazena dados do usuario apenas no lado do usuario (navegador)
      // cookies: armazena dados do usuario tanto para o lado do navegador quanto para o backend da aplicação

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/',
      });
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/',
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');

      // authChannel.postMessage('signIn');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
