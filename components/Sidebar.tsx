import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MyKapLogo, MyKapIcon, HomeIcon, ProspectsIcon, CreditsIcon, LendersIcon, MenuIcon } from './icons';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Prospects', path: '/prospects', icon: ProspectsIcon },
    { name: 'Loans', path: '/loans', icon: CreditsIcon },
    { name: 'Lenders', path: '/lenders', icon: LendersIcon },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className={`bg-white flex flex-col p-4 border-r border-gray-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="mb-6">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4">
            <MyKapIcon className="h-8 w-auto" />
            <button 
              onClick={onToggle} 
              className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"
              aria-label="Toggle Sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg ml-10">
                <MyKapLogo className="h-14 w-auto" />
            </div>
            <button 
              onClick={onToggle} 
              className="text-gray-500 hover:bg-gray-100 p-2 rounded-full ml-auto"
              aria-label="Toggle Sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1">
        <ul>
          {navItems.map((item) => (
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
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;