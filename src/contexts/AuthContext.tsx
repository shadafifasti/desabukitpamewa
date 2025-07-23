import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ensureUserRole } from '@/utils/adminUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Ensure user role exists when session is established
      if (session?.user) {
        ensureUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Ensure user role exists when user signs in
        if (session?.user && event === 'SIGNED_IN') {
          ensureUserRole(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Login gagal",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error) {
      toast({
        title: "Login gagal",
        description: "Terjadi kesalahan saat login",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        toast({
          title: "Registrasi gagal",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Create user role after successful signup
        if (data.user) {
          try {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert([
                {
                  user_id: data.user.id,
                  role: 'user' // Default role is 'user', admin can be set manually
                }
              ]);
            
            if (roleError) {
              console.error('Error creating user role:', roleError);
            }
          } catch (roleError) {
            console.error('Error creating user role:', roleError);
          }
        }
        
        toast({
          title: "Registrasi berhasil",
          description: "Silakan cek email Anda untuk verifikasi",
        });
      }
      
      return { error };
    } catch (error) {
      toast({
        title: "Registrasi gagal",
        description: "Terjadi kesalahan saat registrasi",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Logout gagal",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Logout gagal",
        description: "Terjadi kesalahan saat logout",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};