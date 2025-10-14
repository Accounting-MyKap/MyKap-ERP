import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  signOut: () => void;
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
        // If the profile does not exist (PostgREST error code for "0 rows returned"), attempt to create it.
        if (error.code === 'PGRST116') {
            console.warn(`[Profile Sync] No profile found for user ${user.id}. Attempting to create one.`);
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    first_name: user.user_metadata?.first_name || '',
                    last_name: user.user_metadata?.last_name || ''
                })
                .select()
                .single();
            
            if (createError) {
                console.error('[Profile Sync] Failed to auto-create profile:', createError.message);
                return null; // Return null if creation also fails.
            }
            console.log('[Profile Sync] Profile auto-created successfully.');
            return newProfile as Profile;
        }

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
            // The declarative AuthGuard component now handles all redirection logic
            // when the session becomes null. Removing the imperative navigation call
            // from here resolves the race condition.
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


  const signOut = useCallback(() => {
    console.log('%c[Sign Out] Initiating sign out request...', 'color: #dc3545; font-weight: bold;');
    
    // 1. Immediately clear the local session state.
    // This provides instant feedback to the user by triggering the AuthGuard
    // to redirect to the login page. It also resolves the issue where a hanging
    // signOut request would leave the user stuck on the page or cause an
    // infinite loading screen on reload.
    setSession(null);
    setUser(null);
    setProfile(null);

    // 2. As a background task, inform Supabase to invalidate the session on the server.
    // We don't await this. If it fails or hangs, the user is already logged out
    // from the UI's perspective, which is the most important part.
    supabase.auth.signOut().catch(error => {
        console.warn('[Sign Out] Server-side sign out failed, but local state was successfully cleared.', error);
    });
  }, []);

  const updateProfile = useCallback(async (updatedProfile: Partial<Profile>): Promise<{ error: { message: string } | null }> => {
    console.log('%c[Update Profile] Attempting to update profile...', 'color: #28a745; font-weight: bold;', updatedProfile);
    
    if (!user) {
        console.error('[Update Profile] Update failed: User not authenticated.');
        return { error: { message: 'User not authenticated.' } };
    }
    
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
    
    console.warn('[Update Profile] Supabase returned no data and no error.');
    return { error: { message: 'Update operation returned no data.' } };

  }, [user, profile]);

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