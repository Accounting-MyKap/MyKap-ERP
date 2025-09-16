import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

// Define the profile type
interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
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

    // Step 1: Fetch the profile as usual.
    const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
    }
    
    // Step 2: Check if the email is missing or out of sync.
    // The user's email is the source of truth from `auth.users`.
    if (profileData && (!profileData.email || profileData.email !== user.email)) {
        console.log(`[Profile Sync] Profile for ${user.id} is missing or has a mismatched email. Syncing...`);
        
        // Step 3: Update the profile with the correct email.
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ email: user.email })
            .eq('id', user.id)
            .select()
            .single();
            
        if (updateError) {
            console.error('Error syncing profile email:', updateError.message);
            // Return the original data, even if stale, on update failure.
            return profileData as Profile;
        }
        
        console.log('[Profile Sync] Email sync successful.');
        return updatedProfile as Profile; // Return the freshly updated profile.
    }

    return profileData as Profile; // Return the profile if it's already correct.
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log('Setting up real-time auth state listener...');

    // Rely solely on onAuthStateChange. It fires immediately with the current session state
    // and then listens for any future changes. This avoids race conditions with getSession().
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
        
        // The first time this runs, it will set loading to false.
        setLoading(false);
    });
    
    // Cleanup the listener when the component unmounts.
    return () => {
        if (subscription) {
            console.log('Unsubscribing from onAuthStateChange listener.');
            subscription.unsubscribe();
        }
    };
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