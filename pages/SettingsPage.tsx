import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';

const SettingsPage: React.FC = () => {
    const { profile, updateProfile, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        second_surname: '',
        phone_number: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || '',
                middle_name: profile.middle_name || '',
                last_name: profile.last_name || '',
                second_surname: profile.second_surname || '',
                phone_number: profile.phone_number || '',
            });
        }
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setNotification(null);

        try {
            const updatedProfileData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                middle_name: formData.middle_name || null,
                second_surname: formData.second_surname || null,
                phone_number: formData.phone_number || null,
            };
    
            const { error } = await updateProfile(updatedProfileData);
    
            if (error) {
                setNotification({ type: 'error', message: `Error updating profile: ${error.message}` });
            } else {
                setNotification({ type: 'success', message: 'Profile updated successfully!' });
            }
        } catch (err) {
            console.error(err);
            setNotification({ type: 'error', message: 'An unexpected error occurred.' });
        } finally {
            setIsSaving(false);
            // Clear the notification after 3 seconds for a better user experience
            setTimeout(() => {
                setNotification(null);
            }, 3000);
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
                            <input type="text" name="first_name" id="first_name" value={formData.first_name} onChange={handleInputChange} className="input-field" required />
                        </div>
                        <div>
                            <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-1">Middle Name (Optional)</label>
                            <input type="text" name="middle_name" id="middle_name" value={formData.middle_name} onChange={handleInputChange} className="input-field" />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input type="text" name="last_name" id="last_name" value={formData.last_name} onChange={handleInputChange} className="input-field" required />
                        </div>
                        <div>
                            <label htmlFor="second_surname" className="block text-sm font-medium text-gray-700 mb-1">Second Surname</label>
                            <input type="text" name="second_surname" id="second_surname" value={formData.second_surname} onChange={handleInputChange} className="input-field" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" name="phone_number" id="phone_number" value={formData.phone_number} onChange={handleInputChange} className="input-field" />
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-6 flex items-center justify-end">
                        {notification && (
                            <div className={`mr-4 text-sm ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {notification.message}
                            </div>
                        )}
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