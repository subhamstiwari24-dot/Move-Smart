import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  User, 
  UserRole, 
  LoginCredentials, 
  RegisterCredentials, 
  CreateStaffCredentials,
  ResetPasswordCredentials,
  UpdateProfileCredentials,
  ChangePasswordCredentials
} from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isCitizen: boolean;
  isOperations: boolean;
  isAdmin: boolean;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  updateProfile: (credentials: UpdateProfileCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
  changePassword: (credentials: ChangePasswordCredentials) => Promise<{ success: boolean; message?: string; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginDemo: (type: 'citizen' | 'operations' | 'admin') => Promise<void>;
  
  // User management for authorized admin
  allUsers: User[];
  loadAllUsers: () => Promise<void>;
  createStaffUser: (credentials: CreateStaffCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
  toggleUserActive: (userId: string, active: boolean) => Promise<{ success: boolean; error?: string }>;

  // Modal controls
  authModalOpen: boolean;
  openAuthModal: (mode?: 'citizen-login' | 'citizen-register' | 'admin-login' | 'forgot-password') => void;
  closeAuthModal: () => void;
  authModalMode: 'citizen-login' | 'citizen-register' | 'admin-login' | 'forgot-password';
  setAuthModalMode: (mode: 'citizen-login' | 'citizen-register' | 'admin-login' | 'forgot-password') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [token, setToken] = useState<string | null>(() => authService.getStoredToken());
  const [sessionExpired, setSessionExpired] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'citizen-login' | 'citizen-register' | 'admin-login' | 'forgot-password'>('citizen-login');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Register session expired listener
  useEffect(() => {
    const unsubscribe = authService.onSessionExpired(() => {
      setUser(null);
      setToken(null);
      setSessionExpired(true);
      setAuthModalMode('citizen-login');
      setAuthModalOpen(true);
    });
    return unsubscribe;
  }, []);

  // Verify session and fetch fresh user on mount
  useEffect(() => {
    if (token) {
      authService.getCurrentUser().then((currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
          setToken(null);
        }
      });
    }
  }, [token]);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setSessionExpired(false);
    const res = await authService.login(credentials);
    if (res.success && res.user) {
      setUser(res.user);
      setToken(authService.getStoredToken());
      setAuthModalOpen(false);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error };
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setSessionExpired(false);
    const res = await authService.register(credentials);
    if (res.success && res.user) {
      setUser(res.user);
      setToken(authService.getStoredToken());
      setAuthModalOpen(false);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error };
  }, []);

  const updateProfile = useCallback(async (credentials: UpdateProfileCredentials) => {
    const res = await authService.updateProfile(credentials);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  }, []);

  const changePassword = useCallback(async (credentials: ChangePasswordCredentials) => {
    return await authService.changePassword(credentials);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setAllUsers([]);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return await authService.requestPasswordReset(email);
  }, []);

  const resetPassword = useCallback(async (credentials: ResetPasswordCredentials) => {
    return await authService.resetPassword(credentials);
  }, []);

  const loginDemo = useCallback(async (type: 'citizen' | 'operations' | 'admin') => {
    if (type === 'admin') {
      await login({ email: 'admin@movesmart.city', password: 'Admin@2026' });
    } else if (type === 'operations') {
      await login({ email: 'ops.admin@movesmart.city', password: 'Operations@2026' });
    } else {
      await login({ email: 'citizen.mumbai@movesmart.city', password: 'Citizen@2026' });
    }
  }, [login]);

  const loadAllUsers = useCallback(async () => {
    const users = await authService.getAllUsers();
    setAllUsers(users);
  }, []);

  const createStaffUser = useCallback(async (credentials: CreateStaffCredentials) => {
    const res = await authService.createStaffUser(credentials);
    if (res.success && res.user) {
      setAllUsers((prev) => [res.user!, ...prev]);
    }
    return res;
  }, []);

  const toggleUserActive = useCallback(async (userId: string, active: boolean) => {
    const res = await authService.toggleUserActive(userId, active);
    if (res.success && res.user) {
      setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active } : u)));
    }
    return { success: res.success, error: res.error };
  }, []);

  const openAuthModal = useCallback((mode: 'citizen-login' | 'citizen-register' | 'admin-login' | 'forgot-password' = 'citizen-login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const role = user?.role || null;
  const isAuthenticated = !!user;
  const isCitizen = role === 'ROLE_CITIZEN';
  const isOperations = role === 'ROLE_OPERATIONS';
  const isAdmin = role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        isCitizen,
        isOperations,
        isAdmin,
        sessionExpired,
        clearSessionExpired,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        loginDemo,
        allUsers,
        loadAllUsers,
        createStaffUser,
        toggleUserActive,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
