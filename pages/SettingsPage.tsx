// pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const SettingsPage: React.FC = () => {
    const { profile, updateProfile, loading: authLoading } = useAuth();
    
    // State is now managed per-field to prevent unstable re-render cycles.
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [secondSurname, setSecondSurname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);


    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();


    // Sync form with profile (only when not saving to prevent conflicts)
    useEffect(() => {
        if (profile && !isSaving) {
            setFirstName(profile.first_name || '');
            setMiddleName(profile.middle_name || '');
            setLastName(profile.last_name || '');
            setSecondSurname(profile.second_surname || '');
            setPhoneNumber(profile.phone_number || '');
            setErrors({}); // Clear errors on re-sync
        }
    }, [profile, isSaving]);

    // Track unsaved changes
    useEffect(() => {
        if (!profile) return;

        const hasChanges = 
            firstName !== (profile.first_name || '') ||
            middleName !== (profile.middle_name || '') ||
            lastName !== (profile.last_name || '') ||
            secondSurname !== (profile.second_surname || '') ||
            phoneNumber !== (profile.phone_number || '');

        setHasUnsavedChanges(hasChanges);
    }, [firstName, middleName, lastName, secondSurname, phoneNumber, profile]);

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = ''; // Standard for most browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!firstName.trim()) {
            newErrors.first_name = 'First name is required';
        } else if (firstName.length > 50) {
            newErrors.first_name = 'First name must be 50 characters or less';
        } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(firstName)) {
            newErrors.first_name = 'First name contains invalid characters';
        }

        if (!lastName.trim()) {
            newErrors.last_name = 'Last name is required';
        } else if (lastName.length > 50) {
            newErrors.last_name = 'Last name must be 50 characters or less';
        } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(lastName)) {
            newErrors.last_name = 'Last name contains invalid characters';
        }

        if (middleName && middleName.length > 50) {
            newErrors.middle_name = 'Middle name must be 50 characters or less';
        }

        if (secondSurname && secondSurname.length > 50) {
            newErrors.second_surname = 'Second surname must be 50 characters or less';
        }

        if (phoneNumber && !/^\+?[\d\s()-]+$/.test(phoneNumber)) {
            newErrors.phone_number = 'Invalid phone number format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleReset = () => {
        if (profile) {
            setFirstName(profile.first_name || '');
            setMiddleName(profile.middle_name || '');
            setLastName(profile.last_name || '');
            setSecondSurname(profile.second_surname || '');
            setPhoneNumber(profile.phone_number || '');
            setErrors({});
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fix the errors in the form.', 'error');
            return;
        }

        setIsSaving(true);

        try {
            const updatedProfileData = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                middle_name: middleName.trim() || null,
                second_surname: secondSurname.trim() || null,
                phone_number: phoneNumber.trim() || null,
            };
    
            const result = await updateProfile(updatedProfileData);
    
            // FIX: Restructured to an if/else block. This provides a clearer
            // control flow for the TypeScript compiler to correctly narrow the type of `result`
            // and ensure `result.error` is only accessed in the `else` branch where it is guaranteed to exist.
            if (result.success) {
                // If the code reaches here, `result.success` is true.
                showToast('Profile updated successfully!', 'success');
                setHasUnsavedChanges(false);
            } else {
                // In this block, `result` is correctly inferred as { success: false; error: string; }
                throw new Error(result.error);
            }

        } catch (err: any) {
            console.error(err);
             // Re-sync form with profile in case of error (AuthContext reverted the optimistic update)
            if (profile) {
                setFirstName(profile.first_name || '');
                setMiddleName(profile.middle_name || '');
                setLastName(profile.last_name || '');
                setSecondSurname(profile.second_surname || '');
                setPhoneNumber(profile.phone_number || '');
            }
            showToast(err.message || 'An unexpected error occurred.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-700">Loading Settings...</div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <Header title="Account Settings" subtitle="Manage your personal information and preferences." />

            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email (Read-only) */}
                        <div className="md:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input 
                                type="email" 
                                id="email"
                                value={profile?.email || ''} 
                                disabled 
                                className="input-field bg-gray-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Contact support to change your email address.
                            </p>
                        </div>

                        {/* First Name */}
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="first_name" 
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)} 
                                className={`input-field ${errors.first_name ? 'border-red-500' : ''}`}
                                aria-invalid={!!errors.first_name}
                                aria-describedby={errors.first_name ? 'first_name_error' : undefined}
                                required 
                            />
                            {errors.first_name && (
                                <p id="first_name_error" className="text-red-500 text-xs mt-1">
                                    {errors.first_name}
                                </p>
                            )}
                        </div>

                        {/* Middle Name */}
                        <div>
                            <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Middle Name
                            </label>
                            <input 
                                type="text" 
                                id="middle_name" 
                                value={middleName} 
                                onChange={(e) => setMiddleName(e.target.value)} 
                                className={`input-field ${errors.middle_name ? 'border-red-500' : ''}`}
                                aria-invalid={!!errors.middle_name}
                                aria-describedby={errors.middle_name ? 'middle_name_error' : undefined}
                            />
                            {errors.middle_name && (
                                <p id="middle_name_error" className="text-red-500 text-xs mt-1">
                                    {errors.middle_name}
                                </p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="last_name" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)} 
                                className={`input-field ${errors.last_name ? 'border-red-500' : ''}`}
                                aria-invalid={!!errors.last_name}
                                aria-describedby={errors.last_name ? 'last_name_error' : undefined}
                                required 
                            />
                            {errors.last_name && (
                                <p id="last_name_error" className="text-red-500 text-xs mt-1">
                                    {errors.last_name}
                                </p>
                            )}
                        </div>

                        {/* Second Surname */}
                        <div>
                            <label htmlFor="second_surname" className="block text-sm font-medium text-gray-700 mb-1">
                                Second Surname
                            </label>
                            <input 
                                type="text" 
                                id="second_surname" 
                                value={secondSurname} 
                                onChange={(e) => setSecondSurname(e.target.value)} 
                                className={`input-field ${errors.second_surname ? 'border-red-500' : ''}`}
                                aria-invalid={!!errors.second_surname}
                                aria-describedby={errors.second_surname ? 'second_surname_error' : undefined}
                            />
                            {errors.second_surname && (
                                <p id="second_surname_error" className="text-red-500 text-xs mt-1">
                                    {errors.second_surname}
                                </p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="md:col-span-2">
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input 
                                type="tel" 
                                id="phone_number" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)} 
                                placeholder="+1 (555) 123-4567"
                                className={`input-field ${errors.phone_number ? 'border-red-500' : ''}`}
                                aria-invalid={!!errors.phone_number}
                                aria-describedby={errors.phone_number ? 'phone_number_error' : undefined}
                            />
                            {errors.phone_number && (
                                <p id="phone_number_error" className="text-red-500 text-xs mt-1">
                                    {errors.phone_number}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-6 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isSaving || !hasUnsavedChanges}
                            className="text-gray-600 font-medium py-2 px-4 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Reset Changes
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !hasUnsavedChanges}
                            className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;