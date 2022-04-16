import { createContext, ReactNode, useState } from 'react';
import { setCookie } from 'nookies';
import Router from 'next/router';
import { api } from '../services/api';

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
  signIn(credentials: SignInCredenntials): Promise<void>;
  signOut(): void;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  async function signIn({ email, password }: SignInCredenntials) {
    try {
      const response = await api.post<AuthResponse>('sessions', {
        email,
        password,
      });

      const { permissions, roles, refreshToken, token } = response.data;

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

      Router.push('/dashboard');
    } catch (error) {
      console.log(error);
    }
  }

  function signOut() {}

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, signOut, user }}>
      {children}
    </AuthContext.Provider>
  );
}
