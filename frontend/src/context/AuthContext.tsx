import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithAuth } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  sessionToken: string | null;
  requiresPasswordChange: boolean;
  login: (username: string, password: string) => Promise<{ session_token: string; requires_password_change: boolean }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  verifyToken: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('adminSessionToken');
    if (savedToken) {
      verifyToken(savedToken).then((valid) => {
        if (valid) {
          setSessionToken(savedToken);
          setIsAuthenticated(true);
          const requiresChange = localStorage.getItem('adminRequiresPasswordChange') === 'true';
          setRequiresPasswordChange(requiresChange);
        } else {
          localStorage.removeItem('adminSessionToken');
          localStorage.removeItem('adminRequiresPasswordChange');
        }
      });
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetchWithAuth('/api/v1/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setSessionToken(data.session_token);
    setIsAuthenticated(true);
    setRequiresPasswordChange(data.requires_password_change);

    // Save to localStorage
    localStorage.setItem('adminSessionToken', data.session_token);
    localStorage.setItem('adminRequiresPasswordChange', String(data.requires_password_change));

    return data;
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!sessionToken) throw new Error('Not authenticated');

    const response = await fetchWithAuth(
      `/api/v1/admin/change-password?token=${sessionToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      }
    );

    if (!response.ok) {
      throw new Error('Password change failed');
    }

    setRequiresPasswordChange(false);
    localStorage.setItem('adminRequiresPasswordChange', 'false');
  };

  const logout = () => {
    if (sessionToken) {
      fetchWithAuth(`/api/v1/admin/logout?token=${sessionToken}`, { method: 'POST' }).catch(
        () => {}
      );
    }
    setIsAuthenticated(false);
    setSessionToken(null);
    setRequiresPasswordChange(false);
    localStorage.removeItem('adminSessionToken');
    localStorage.removeItem('adminRequiresPasswordChange');
  };

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetchWithAuth(`/api/v1/admin/verify?token=${token}`);
      const data = await response.json();
      return data.valid === true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        sessionToken,
        requiresPasswordChange,
        login,
        changePassword,
        logout,
        verifyToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

