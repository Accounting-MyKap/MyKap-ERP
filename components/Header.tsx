import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
    const { user, profile, signOut } = useAuth();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const userName = profile ? `${profile.first_name} ${profile.last_name}` : '';
    const userInitial = profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() ?? 'U';

    const handleSignOut = () => {
        console.log('%c[Sign Out] Initiating sign out request...', 'color: #dc3545; font-weight: bold;');
        signOut();
        // Navigation is now handled by the AuthGuard reacting to the immediate
        // local state cleanup within the signOut function.
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{title || `Welcome back, ${userName}!`}</h1>
                <p className="text-gray-500 mt-1">{subtitle || 'Select a module to start working.'}</p>
            </div>
            
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    {userInitial}
                </button>

                {isDropdownOpen && (
                    <div
                        className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                    >
                        <div className="py-1" role="none">
                            <div className="px-4 py-2 border-b border-gray-200">
                                <p className="text-sm font-semibold text-gray-900" role="none">
                                    {userName}
                                </p>
                                <p className="text-sm text-gray-500" role="none">
                                    {user?.email}
                                </p>
                            </div>
                            <Link
                                to="/settings"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Settings
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                role="menuitem"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;