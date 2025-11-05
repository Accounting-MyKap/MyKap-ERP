import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
// FIX: The user's version of '@supabase/supabase-js' does export Session or User with the correct v2 setup.
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

// Improved return type for updateProfile
type UpdateProfileResult = 
    | { success: true; profile: Profile }
    | { success: false; error: string };

// Define the context shape with improved error typing
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  updateProfile: (updatedProfile: Partial<Profile>) => Promise<UpdateProfileResult>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Valid roles for runtime validation
const VALID_ROLES = ['admin', 'loan_officer', 'financial_officer'] as const;
type Role = typeof VALID_ROLES[number];

// Validate role to ensure data integrity
const validateRole = (role: unknown): Role | null => {
    if (role === null) return null;
    if (typeof role === 'string' && VALID_ROLES.includes(role as Role)) {
        return role as Role;
    }
    console.error('[Role Validation] Invalid role received:', role);
    return null;
};

// Validate profile data structure
const validateProfile = (data: any): Profile | null => {
    if (!data || typeof data !== 'object') {
        console.error('[Profile Validation] Invalid profile data structure');
        return null;
    }

    // Validate required fields
    if (!data.id || typeof data.id !== 'string') {
        console.error('[Profile Validation] Missing or invalid id');
        return null;
    }

    return {
        id: data.id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || null,
        middle_name: data.middle_name || null,
        second_surname: data.second_surname || null,
        phone_number: data.phone_number || null,
        role: validateRole(data.role),
    };
};

// Helper function to fetch a user's profile with retry logic
const fetchProfile = async (
    user: User | null,
    maxRetries = 3
): Promise<Profile | null> => {
    if (!user) return null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
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
                        
                        // Create a minimal profile in memory as fallback
                        console.warn('[Profile Sync] Using in-memory fallback profile');
                        return {
                            id: user.id,
                            email: user.email,
                            first_name: user.user_metadata?.first_name || '',
                            last_name: user.user_metadata?.last_name || '',
                            middle_name: null,
                            second_surname: null,
                            phone_number: null,
                            role: null
                        };
                    }
                    
                    if (import.meta.env.DEV) {
                        console.log('[Profile Sync] Profile auto-created successfully.');
                    }
                    return validateProfile(newProfile);
                }

                // For other errors, throw to trigger retry
                throw error;
            }
            
            // Step 2: Check if the email is missing or out of sync.
            if (profileData && (!profileData.email || profileData.email !== user.email)) {
                if (import.meta.env.DEV) {
                    console.log(`[Profile Sync] Email mismatch detected. Syncing for user ${user.id}...`);
                }
                
                // Step 3: Update the profile with the correct email.
                const { data: updatedProfile, error: updateError } = await supabase
                    .from('profiles')
                    .update({ email: user.email })
                    .eq('id', user.id)
                    .select()
                    .single();
                    
                if (updateError) {
                    console.error('[Profile Sync] Error syncing profile email:', updateError.message);
                    
                    // Retry once for email sync
                    const { data: retryData, error: retryError } = await supabase
                        .from('profiles')
                        .update({ email: user.email })
                        .eq('id', user.id)
                        .select()
                        .single();
                    
                    if (retryError) {
                        console.error('[Profile Sync] Email sync retry failed:', retryError.message);
                        // Return profile with corrected email in-memory
                        return validateProfile({ ...profileData, email: user.email });
                    }
                    
                    if (import.meta.env.DEV) {
                        console.log('[Profile Sync] Email sync successful on retry.');
                    }
                    return validateProfile(retryData);
                }
                
                if (import.meta.env.DEV) {
                    console.log('[Profile Sync] Email sync successful.');
                }
                return validateProfile(updatedProfile);
            }

            return validateProfile(profileData);

        } catch (error: any) {
            console.error(`[Profile Fetch] Attempt ${attempt}/${maxRetries} failed:`, error.message);
            
            if (attempt === maxRetries) {
                console.error('[Profile Fetch] All retry attempts exhausted');
                return null;
            }
            
            // Exponential backoff with max delay of 10 seconds
            const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
            if (import.meta.env.DEV) {
                console.log(`[Profile Fetch] Retrying in ${delay}ms...`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return null;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const latestUserId = useRef<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // Step 1: Set up the auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (!isMounted.current) return;
            
            // Update session and user state regardless of the event type
            setSession(newSession);
            const newCurrentUser = newSession?.user ?? null;
            latestUserId.current = newCurrentUser?.id ?? null;
            setUser(newCurrentUser);

            switch (_event) {
                case 'SIGNED_IN':
                case 'USER_UPDATED':
                    if (newCurrentUser && isMounted.current) {
                        const userProfile = await fetchProfile(newCurrentUser);
                        if (latestUserId.current === newCurrentUser.id && isMounted.current) {
                            setProfile(userProfile);
                        }
                    }
                    break;
                
                case 'SIGNED_OUT':
                    if (isMounted.current) {
                        setProfile(null);
                        if (import.meta.env.DEV) {
                            console.log('%c[Sign Out] Local state cleared via listener.', 'color: #28a745; font-weight: bold;');
                        }
                    }
                    break;
                
                case 'TOKEN_REFRESHED':
                    // This is now handled by the logger in supabase.ts
                    break;
            }
        });

        authSubscription = subscription;

        // Step 2: Get the initial session AFTER listener is set up
        // FIX: Reverted to the async `getSession()` (v2) from `session()` (v1).
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!isMounted.current) return;

        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        latestUserId.current = currentUser?.id ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          const userProfile = await fetchProfile(currentUser);
          if (latestUserId.current === currentUser.id && isMounted.current) {
            setProfile(userProfile);
          }
        }
        
        if (isMounted.current) {
          setLoading(false);
        }

      } catch (error) {
        console.error('[Auth] Initialization error:', error);
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (authSubscription) {
        if (import.meta.env.DEV) {
          console.log('[Auth] Unsubscribing from onAuthStateChange listener.');
        }
        authSubscription.unsubscribe();
      }
    };
  }, [navigate]);


  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('[Sign Out] Supabase sign out failed:', error);
        throw new Error("Sign out failed. Please check your network connection and try again.");
    }
    
    // Navigate to login page. The onAuthStateChange listener will handle clearing the session state.
    navigate('/login', { replace: true });
    
  }, [navigate]);

  const updateProfile = useCallback(async (
    updatedProfile: Partial<Profile>
  ): Promise<UpdateProfileResult> => {
    if (import.meta.env.DEV) {
      console.log('%c[Update Profile] Attempting to update profile...', 'color: #28a745; font-weight: bold;', updatedProfile);
    }
    
    if (!user) {
        console.error('[Update Profile] Update failed: User not authenticated.');
        return { success: false, error: 'User not authenticated.' };
    }

    if (!profile) {
        console.error('[Update Profile] Update failed: Profile not loaded.');
        return { success: false, error: 'Profile not loaded.' };
    }
    
    const hasChanges = Object.keys(updatedProfile).some(
        key => profile[key as keyof Profile] !== updatedProfile[key as keyof Profile]
    );

    if (!hasChanges) {
        if (import.meta.env.DEV) {
          console.log('[Update Profile] No changes detected, skipping update.');
        }
        return { success: true, profile };
    }
    
    // Optimistic update
    const previousProfile = profile;
    const optimisticProfile = { ...profile, ...updatedProfile };
    setProfile(optimisticProfile);

    try {
      const { data, error } = await supabase
          .from('profiles')
          .update(updatedProfile)
          .eq('id', user.id)
          .select()
          .single();

      if (error) {
          console.error('[Update Profile] Supabase update error:', error);
          // Revert optimistic update
          setProfile(previousProfile);
          return { success: false, error: error.message || 'An unknown update error occurred.' };
      }

      if (data) {
          const validatedProfile = validateProfile(data);
          if (!validatedProfile) {
              console.error('[Update Profile] Profile validation failed after update');
              setProfile(previousProfile);
              return { success: false, error: 'Invalid profile data received from server.' };
          }

          if (import.meta.env.DEV) {
            console.log('[Update Profile] Update successful.');
          }
          setProfile(validatedProfile);
          return { success: true, profile: validatedProfile };
      }
      
      console.warn('[Update Profile] Supabase returned no data and no error.');
      setProfile(previousProfile);
      return { success: false, error: 'Update operation returned no data.' };

    } catch (error: any) {
      console.error('[Update Profile] Unexpected error:', error);
      setProfile(previousProfile);
      return { success: false, error: error.message || 'An unexpected error occurred.' };
    }

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