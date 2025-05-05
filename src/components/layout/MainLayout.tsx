import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ViewBoardsIcon,
  CalendarIcon,
  UserCircleIcon,
  MenuIcon,
  XIcon,
} from '@heroicons/react/outline';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Tasks', path: '/tasks', icon: ViewBoardsIcon },
    { name: 'Meetings', path: '/meetings', icon: CalendarIcon },
    { name: 'Profile', path: '/profile', icon: UserCircleIcon },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed z-50 top-4 right-4 p-2 rounded-md bg-primary text-white lg:hidden"
      >
        {isSidebarOpen ? (
          <XIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 z-40 h-screen w-64 bg-white shadow-lg"
          >
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
                <span className="text-xl font-bold text-primary">AI Task Manager</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="mt-8 px-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActivePath(item.path)
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User Profile Preview */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              <Link
                to="/profile"
                className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <img
                  src="/default-avatar.png"
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    John Doe
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    john.doe@example.com
                  </p>
                </div>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          window.innerWidth >= 1024 ? 'lg:ml-64' : ''
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 