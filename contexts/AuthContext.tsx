import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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

// Define the context shape with improved error typing
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  updateProfile: (updatedProfile: Partial<Profile>) => Promise<{ error: { message: string } | null }>;
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
            // Improvement: Return the profile with the correct email in-memory even if DB update fails.
            return { ...profileData, email: user.email } as Profile;
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
  
  // Ref to track the latest user ID to prevent race conditions during async operations.
  const latestUserId = useRef<string | null>(null);

  useEffect(() => {
    // This function handles the initial session check.
    const initializeSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();

      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
      latestUserId.current = currentUser?.id ?? null; // Initialize ref
      setUser(currentUser);
      
      if (currentUser) {
        const userProfile = await fetchProfile(currentUser);
        // Check against the ref to ensure user hasn't changed during the async fetch.
        if (latestUserId.current === currentUser.id) {
          setProfile(userProfile);
        }
      }
      
      setLoading(false);
    };

    initializeSession();

    // Set up a listener for subsequent auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        console.log(`%c[Auth State Change] Event: ${_event}`, 'color: #007bff; font-weight: bold;', { session: newSession });
        
        setSession(newSession);
        const newCurrentUser = newSession?.user ?? null;
        latestUserId.current = newCurrentUser?.id ?? null; // Update ref immediately with the latest user ID.
        setUser(newCurrentUser);

        if (newCurrentUser) {
            const userProfile = await fetchProfile(newCurrentUser);
            // After await, check if the ref's value still matches the user we fetched for.
            // This prevents setting a profile if the user has signed out in the meantime.
            if (latestUserId.current === newCurrentUser.id) {
                setProfile(userProfile);
            } else {
                console.log(`[Auth State Change] Profile fetch for ${newCurrentUser.id} aborted; user has changed.`);
            }
        } else {
            setProfile(null);
        }
    });

    // Cleanup the listener when the component unmounts.
    return () => {
        if (subscription) {
            console.log('Unsubscribing from onAuthStateChange listener.');
            subscription.unsubscribe();
        }
    };
  }, []);


  const signOut = useCallback(async () => {
    console.log('%c[Sign Out] Attempting to sign out...', 'color: #dc3545; font-weight: bold;');
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('[Sign Out] Supabase signOut error:', error);
    } else {
        console.log('[Sign Out] Supabase sign out successful.');
    }
  }, []);

  const updateProfile = useCallback(async (updatedProfile: Partial<Profile>): Promise<{ error: { message: string } | null }> => {
    console.log('%c[Update Profile] Attempting to update profile...', 'color: #28a745; font-weight: bold;', updatedProfile);
    
    if (!user) {
        console.error('[Update Profile] Update failed: User not authenticated.');
        return { error: { message: 'User not authenticated.' } };
    }
    
    // Optimization: Check if there are any actual changes before calling Supabase.
    const hasChanges = Object.keys(updatedProfile).some(
        key => profile?.[key as keyof Profile] !== updatedProfile[key as keyof Profile]
    );

    if (!hasChanges) {
        console.log('[Update Profile] No changes detected, skipping update.');
        return { error: null };
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
        return { error: { message: error.message || 'An unknown update error occurred.' } };
    }

    if (data) {
        console.log('[Update Profile] Update successful. New profile data:', data);
        setProfile(data as Profile);
        return { error: null };
    }
    
    // This case should not happen if the Supabase client works as expected, but it's good practice to handle.
    console.warn('[Update Profile] Supabase returned no data and no error.');
    return { error: { message: 'Update operation returned no data.' } };

  }, [user, profile]); // Added profile to dependencies for the change check.

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