'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'counselor' | 'parent';
}

interface HeaderProps {
  showAuthButtons?: boolean;
  title?: string;
}

export default function Header({ showAuthButtons = true, title }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth-db/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    setUser(null);
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'student':
        return '/dashboard';
      case 'counselor':
        return '/counselor/dashboard';
      case 'parent':
        return '/parent/dashboard';
      default:
        return '/dashboard';
    }
  };

  const getRoleBadge = () => {
    if (!user) return null;
    
    const roleColors = {
      student: 'bg-blue-100 text-blue-800',
      counselor: 'bg-purple-100 text-purple-800',
      parent: 'bg-green-100 text-green-800'
    };

    const roleLabels = {
      student: 'Student',
      counselor: 'Counselor',
      parent: 'Parent'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]}`}>
        {roleLabels[user.role]}
      </span>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lantern AI</h1>
                {title && <p className="text-sm text-gray-500">{title}</p>}
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">
              💼 Jobs
            </Link>
            {user && (
              <>
                <Link href="/assessment" className="text-gray-700 hover:text-blue-600 transition-colors">
                  📝 Assessment
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition-colors">
                  👤 Profile
                </Link>
              </>
            )}
          </nav>

          {/* Navigation and Auth */}
          <div className="flex items-center space-x-4">
            {showAuthButtons && (
              <>
                {isLoading ? (
                  <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : user ? (
                  <div className="flex items-center space-x-4">
                    {getRoleBadge()}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">
                        Welcome, {user.firstName}!
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          href={getDashboardLink()}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}