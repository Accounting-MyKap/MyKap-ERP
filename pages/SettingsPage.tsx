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

    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();


    // CRITICAL FIX: The dependency is now profile.id.
    // This effect now ONLY syncs the form state when the user logs in/out or the profile is re-fetched.
    // This breaks the re-render cycle during a save operation, preventing any application freeze.
    useEffect(() => {
        if (profile) {
            setFirstName(profile.first_name || '');
            setMiddleName(profile.middle_name || '');
            setLastName(profile.last_name || '');
            setSecondSurname(profile.second_surname || '');
            setPhoneNumber(profile.phone_number || '');
        }
    }, [profile?.id]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const updatedProfileData = {
                first_name: firstName,
                last_name: lastName,
                middle_name: middleName || null,
                second_surname: secondSurname || null,
                phone_number: phoneNumber || null,
            };
    
            const { error } = await updateProfile(updatedProfileData);
    
            if (error) {
                throw error;
            }
            showToast('Profile updated successfully!', 'success');
        } catch (err: any) {
            console.error(err);
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
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input type="text" name="first_name" id="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-1">Middle Name (Optional)</label>
                            <input type="text" name="middle_name" id="middle_name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input type="text" name="last_name" id="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label htmlFor="second_surname" className="block text-sm font-medium text-gray-700 mb-1">Second Surname</label>
                            <input type="text" name="second_surname" id="second_surname" value={secondSurname} onChange={(e) => setSecondSurname(e.target.value)} className="input-field" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" name="phone_number" id="phone_number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="input-field" />
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-6 flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
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
