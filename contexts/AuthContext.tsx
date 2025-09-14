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
  role: 'admin' | 'loan_officer' | 'financial_officer' | null;
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
    console.log('Starting initial session check...');

    // 1. Perform initial session check on component mount to determine the initial state.
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
        console.log('Initial session fetched:', initialSession ? 'Exists' : 'None');
        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
            const userProfile = await fetchProfile(currentUser);
            setProfile(userProfile);
        }

        // 2. Mark initial loading as complete. This happens only once.
        setLoading(false);
        console.log('Initial loading complete. Setting up real-time auth state listener...');

        // 3. Set up the listener for REAL-TIME auth changes (e.g., login, logout).
        //    This listener will NOT touch the `loading` state again.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            console.log(`%c[Auth State Change] Event: ${_event}`, 'color: #007bff; font-weight: bold;', { session: newSession });
            
            setSession(newSession);
            const newCurrentUser = newSession?.user ?? null;
            setUser(newCurrentUser);

            if (newCurrentUser) {
                const userProfile = await fetchProfile(newCurrentUser);
                setProfile(userProfile);
            } else {
                setProfile(null);
            }
        });
        
        // 4. Return the cleanup function for the listener.
        return () => {
            if (subscription) {
                console.log('Unsubscribing from onAuthStateChange listener.');
                subscription.unsubscribe();
            }
        };
    });
  }, []); // Empty dependency array ensures this runs only once on mount.


  const signOut = useCallback(async () => {
    console.log('%c[Sign Out] Attempting to sign out...', 'color: #dc3545; font-weight: bold;');
    setSession(null);
    setUser(null);
    setProfile(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('[Sign Out] Supabase signOut error:', error);
    } else {
        console.log('[Sign Out] Supabase sign out successful.');
    }
  }, []);

  const updateProfile = useCallback(async (updatedProfile: Partial<Profile>) => {
    console.log('%c[Update Profile] Attempting to update profile...', 'color: #28a745; font-weight: bold;', updatedProfile);
    
    if (!user) {
        console.error('[Update Profile] Update failed: User not authenticated.');
        return { error: { message: 'User not authenticated.' } };
    }
    
    console.log('[Update Profile] User validated from context state:', user.id);

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
        setProfile(data as Profile);
    }
    
    return { error };
  }, [user]);

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
