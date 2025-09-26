import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, CloseIcon } from '../icons';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onDismiss: () => void;
}

const toastConfig = {
    success: {
        icon: CheckCircleIcon,
        bg: 'bg-green-50',
        iconColor: 'text-green-500',
        textColor: 'text-green-800',
        progressBar: 'bg-green-500',
    },
    error: {
        icon: ExclamationTriangleIcon,
        bg: 'bg-red-50',
        iconColor: 'text-red-500',
        textColor: 'text-red-800',
        progressBar: 'bg-red-500',
    },
    info: {
        icon: InformationCircleIcon,
        bg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        textColor: 'text-blue-800',
        progressBar: 'bg-blue-500',
    }
};

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    const [exiting, setExiting] = useState(false);
    const config = toastConfig[type];
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            // Allow time for exit animation before calling dismiss
            const dismissTimer = setTimeout(onDismiss, 300);
            return () => clearTimeout(dismissTimer);
        }, 4700); // Start exit animation just before auto-dismiss

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const handleDismiss = () => {
        setExiting(true);
        setTimeout(onDismiss, 300);
    };

    return (
        <div 
            role="alert"
            className={`
                relative w-full rounded-lg shadow-lg overflow-hidden flex items-start p-4
                ${config.bg} 
                transition-all duration-300 ease-in-out
                ${exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
            `}
        >
            <div className="flex-shrink-0">
                <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${config.textColor}`}>
                    {message}
                </p>
            </div>
            <div className="ml-4 flex-shrink-0">
                <button 
                    onClick={handleDismiss} 
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.textColor} ${config.bg} hover:bg-opacity-50`}
                >
                    <span className="sr-only">Close</span>
                    <CloseIcon className="h-5 w-5" />
                </button>
            </div>
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                <div className={`${config.progressBar} h-full animate-progress`}></div>
            </div>
            <style>{`
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation: progress 5s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default Toast;
