// ============================================================
// NIL Perfumes - useAuth Hook
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { AdminUser, AppRole } from '@/types/admin';

interface AuthState {
  user: AdminUser | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

interface UseAuthReturn extends AuthState {
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkRole: () => Promise<AppRole | null>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });

  // Check user role from database
  const checkRole = useCallback(async (): Promise<AppRole | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: roleData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !roleData) return null;
    
    return roleData.role as AppRole;
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (mounted) {
            setState({
              user: null,
              session: null,
              isLoading: false,
              isAdmin: false,
            });
          }
          return;
        }

        // Check role
        const role = await checkRole();
        
        if (mounted) {
          setState({
            user: role ? {
              id: session.user.id,
              email: session.user.email || '',
              role,
            } : null,
            session,
            isLoading: false,
            isAdmin: role === 'admin',
          });
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) {
          setState({
            user: null,
            session: null,
            isLoading: false,
            isAdmin: false,
          });
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setState({
              user: null,
              session: null,
              isLoading: false,
              isAdmin: false,
            });
          }
        } else if (session?.user) {
          const role = await checkRole();
          if (mounted) {
            setState({
              user: role ? {
                id: session.user.id,
                email: session.user.email || '',
                role,
              } : null,
              session,
              isLoading: false,
              isAdmin: role === 'admin',
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkRole]);

  // Send OTP to email
  const signInWithOtp = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new users
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Verify OTP code
  const verifyOtp = async (
    email: string, 
    token: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return {
    ...state,
    signInWithOtp,
    verifyOtp,
    signOut,
    checkRole,
  };
}
