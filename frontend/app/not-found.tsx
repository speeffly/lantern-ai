'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Handle dynamic counselor routes client-side
    if (pathname?.startsWith('/counselor/students/') && pathname !== '/counselor/students/') {
      // Extract student ID from path
      const studentId = pathname.split('/counselor/students/')[1];
      if (studentId && !isNaN(Number(studentId))) {
        // This is a valid student ID route, redirect to the dynamic page
        router.replace(`/counselor/students/${studentId}`);
        return;
      }
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          
          <Link
            href="/login"
            className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Login
          </Link>
          
          <Link
            href="/counselor/dashboard"
            className="block w-full bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors"
          >
            Counselor Dashboard
          </Link>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Current path: {pathname}</p>
        </div>
      </div>
    </div>
  );
}