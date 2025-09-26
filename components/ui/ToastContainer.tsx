import React from 'react';
import { useToast } from '../../hooks/useToast';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-6 right-6 z-50 space-y-3 w-full max-w-sm">
            {toasts.map(toast => (
                <Toast 
                    key={toast.id} 
                    message={toast.message} 
                    type={toast.type} 
                    onDismiss={() => removeToast(toast.id)} 
                />
            ))}
        </div>
    );
};

export default ToastContainer;
