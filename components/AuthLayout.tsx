import React from 'react';
import { MyKapLogo } from './icons';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg w-full">
          <div className="flex justify-center mb-6">
            <MyKapLogo className="h-20 w-auto" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;