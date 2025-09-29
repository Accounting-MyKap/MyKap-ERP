import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MyKapLogo, MyKapIcon, HomeIcon, ProspectsIcon, CreditsIcon, LendersIcon, MenuIcon, UsersIcon, TemplateIcon } from './icons';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { profile } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Prospects', path: '/prospects', icon: ProspectsIcon },
    { name: 'Loans', path: '/loans', icon: CreditsIcon },
    { name: 'Lenders', path: '/lenders', icon: LendersIcon },
  ];

  const adminNavItems = [
    { name: 'Users', path: '/users', icon: UsersIcon, role: 'admin' },
    { name: 'Templates', path: '/templates', icon: TemplateIcon, role: 'admin' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className={`bg-white flex flex-col p-4 border-r border-gray-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header Section */}
      <div className="mb-6">
        {isCollapsed ? (
          // Collapsed View
          <div className="flex flex-col items-center space-y-4">
            <Link to="/dashboard">
              <MyKapIcon className="h-8 w-auto text-blue-600" />
            </Link>
            <button 
              onClick={onToggle} 
              className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg"
              aria-label="Expand sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        ) : (
          // Expanded View
          <div className="flex items-center justify-between">
             <Link to="/dashboard">
              <MyKapLogo className="h-8 w-auto" />
            </Link>
            <button 
              onClick={onToggle} 
              className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg"
              aria-label="Collapse sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1">
        <ul>
          {/* Main Navigation - only show if user has a role */}
          {profile?.role && navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : ''}
              >
                <item.icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}

          {/* Admin Section */}
          {profile?.role === 'admin' && (
             <div className="mt-4 pt-4 border-t">
              {!isCollapsed && <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Admin</p>}
               {adminNavItems.map((item) => (
                  <li key={item.name} className="mb-2">
                    <Link
                      to={item.path}
                      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-blue-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <item.icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
               ))}
             </div>
          )}

        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;