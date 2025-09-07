import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

// Define the profile type
interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  second_surname: string | null;
  phone_number: string | null;
}

// Define the context shape
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  updateProfile: (updatedProfile: Partial<Profile>) => Promise<{ error: any }>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to fetch a user's profile
const fetchProfile = async (user: User | null): Promise<Profile | null> => {
    if (!user) return null;
    const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
    }
    return profileData;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up onAuthStateChange listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log(`%c[Auth State Change] Event: ${_event}`, 'color: #007bff; font-weight: bold;', { session });

      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        console.log('[Auth State Change] Fetching profile for user:', currentUser.id);
        const userProfile = await fetchProfile(currentUser);
        setProfile(userProfile);
        console.log('[Auth State Change] Profile set:', userProfile);
      } else {
        console.log('[Auth State Change] No user session, clearing profile.');
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('Unsubscribing from onAuthStateChange listener.');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    console.log('%c[Sign Out] Attempting to sign out...', 'color: #dc3545; font-weight: bold;');

    // Optimistically clear the local state for an immediate UI update.
    // This ensures the user is redirected to the login page without delay,
    // providing a responsive and reliable logout experience.
    setSession(null);
    setUser(null);
    setProfile(null);

    // Now, perform the actual sign-out from Supabase. This will clear the
    // session from browser storage and invalidate the token on the server.
    // We await this to ensure it completes, but the UI has already updated.
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('[Sign Out] Supabase signOut error:', error);
    } else {
        console.log('[Sign Out] Supabase sign out successful.');
    }
  }, []);

  const updateProfile = useCallback(async (updatedProfile: Partial<Profile>) => {
    console.log('%c[Update Profile] Attempting to update profile...', 'color: #28a745; font-weight: bold;', updatedProfile);
    
    // Rely on the user object from state, which is kept current by the onAuthStateChange listener.
    // This avoids a race condition with manual session fetching.
    if (!user) {
        console.error('[Update Profile] Update failed: User not authenticated.');
        return { error: { message: 'User not authenticated.' } };
    }
    
    console.log('[Update Profile] User validated from context state:', user.id);

    // Perform the update with the validated user ID from state.
    console.log('[Update Profile] Sending update to Supabase...');
    const { data, error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error('[Update Profile] Supabase update error:', error);
    } else if (data) {
        console.log('[Update Profile] Update successful. New profile data:', data);
        setProfile(data);
    }
    
    return { error };
  }, [user]); // Depend on the user state object.

  const value = {
    session,
    user,
    profile,
    signOut,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};