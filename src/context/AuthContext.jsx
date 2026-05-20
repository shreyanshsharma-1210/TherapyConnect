import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase }           from '@/lib/supabase';
import { profileRepository }  from '@/repositories/profileRepository';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,         setUser]         = useState(null);   // auth.users row
  const [profile,      setProfile]      = useState(null);   // public.profiles row
  const [loading,      setLoading]      = useState(true);
  const [initializing, setInitializing] = useState(true);  // true until first session check

  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const p = await profileRepository.getById(user.id);
      if (!p) {
        // Create profile row if missing using upsert for safety
        const newProfile = await profileRepository.upsert(user.id, {
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || null,
          role: 'user',
        });
        setProfile(newProfile);
      } else {
        setProfile(p);
      }
    } catch (err) {
      console.error('[AuthContext] Failed to load profile:', err);
      setProfile(null);
    }
  }, []);

  // Realtime subscription for profile updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, (payload) => {
        setProfile(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Bootstrap session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      loadProfile(u).finally(() => {
        setLoading(false);
        setInitializing(false);
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (!u) setProfile(null);
        }
        loadProfile(u);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = useCallback(async ({ email, password, fullName, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phone || null } },
    });
    if (error) throw error;
    // If profile row already exists (trigger may have run), update phone
    if (data?.user && phone) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: data.user.id, email, full_name: fullName, phone }, { onConflict: 'id' });
      // Profile upsert failure is non-fatal — trigger may have already created it
      if (profileError) console.error('[AuthContext.signUp] Profile upsert failed:', profileError.message);
    }
    return data;
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Load profile immediately so callers can read role without waiting for onAuthStateChange
    if (data?.user) {
      try {
        const p = await profileRepository.getById(data.user.id);
        console.log('[AuthContext.signIn] Profile loaded:', p);
        setProfile(p);
        return { ...data, profile: p };
      } catch (err) {
        console.error('[AuthContext.signIn] Profile load failed:', err);
        // profile load failure is non-fatal
      }
    }
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user) throw new Error('Not authenticated');
    const updated = await profileRepository.update(user.id, updates);
    setProfile(updated);
    return updated;
  }, [user]);

  const isAdmin        = profile?.role === 'admin';
  const isAuthenticated = !!user;
  const emailVerified  = user?.email_confirmed_at != null;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      initializing,
      isAuthenticated,
      isAdmin,
      emailVerified,
      signUp,
      signIn,
      signOut,
      updateProfile,
      refreshProfile: () => loadProfile(user),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
