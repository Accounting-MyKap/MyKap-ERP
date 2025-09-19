import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Header from '../components/Header';
import { ProspectsIcon, CreditsIcon, LendersIcon, CheckCircleIcon, CloseIcon } from '../components/icons';
import { useAuth } from '../hooks/useAuth';

const ModuleCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
        <div className="bg-blue-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-gray-500 mt-1">{description}</p>
        </div>
    </div>
);

const PendingApproval: React.FC = () => (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Account Pending Approval</h2>
        <p className="mt-2 text-gray-600">
            Your account has been successfully created but requires an administrator to assign you a role before you can access any modules. 
            Please contact your system administrator.
        </p>
    </div>
);

const WelcomeToast: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed top-20 right-6 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50">
        <CheckCircleIcon className="h-6 w-6" />
        <span className="font-semibold">Welcome! Your account has been confirmed.</span>
        <button onClick={onClose} className="text-white hover:text-green-100">
            <CloseIcon className="h-5 w-5" />
        </button>
    </div>
);


const DashboardPage: React.FC = () => {
    const { profile } = useAuth();
    const [showWelcomeToast, setShowWelcomeToast] = useState(false);

    useEffect(() => {
        // Show welcome toast only if the user is new (has no role yet)
        if (profile && !profile.role) {
            setShowWelcomeToast(true);
            const timer = setTimeout(() => {
                setShowWelcomeToast(false);
            }, 5000); // Hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [profile]);


    const modules = [
        {
            title: "Prospects",
            description: "Manage and track all loan prospects from pre-validation to closing.",
            icon: ProspectsIcon,
            path: "/prospects",
        },
        {
            title: "Loans",
            description: "View and manage finalized clients and their disbursed loans.",
            icon: CreditsIcon,
            path: "/loans",
        },
        {
            title: "Lenders",
            description: "Manage and track third-party funding sources.",
            icon: LendersIcon,
            path: "/lenders",
        },
    ];

    return (
        <DashboardLayout>
            {showWelcomeToast && <WelcomeToast onClose={() => setShowWelcomeToast(false)} />}
            <Header />
            {profile?.role ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module, index) => {
                        if (module.path) {
                            return (
                                <Link to={module.path} key={index} className="block">
                                    <ModuleCard title={module.title} description={module.description} icon={module.icon} />
                                </Link>
                            )
                        }
                        return (
                            <div key={index} className="opacity-60 cursor-not-allowed">
                                <ModuleCard title={module.title} description={module.description} icon={module.icon} />
                            </div>
                        )
                    })}
                </div>
            ) : (
                <PendingApproval />
            )}
        </DashboardLayout>
    );
};

export default DashboardPage;