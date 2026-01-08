'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, startTransition, useEffect, useMemo, useState } from 'react';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Skip layout for login page
  const isLoginPage = pathname === '/admin/login';

  // Derive loading state instead of using setState
  const isLoading = useMemo(() => {
    if (isLoginPage) return false;
    return !authChecked;
  }, [isLoginPage, authChecked]);

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken');
      // const user = localStorage.getItem('adminUser'); // We'll trust the token verification

      if (!token) {
        router.push('/admin/login');
        return;
      }

      try {
        const res = await fetch('/api/admin/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Use startTransition to avoid cascading render warnings
          startTransition(() => {
            // Update admin state from verified token data if available, or keep using localStorage user for display name
            // Better to use data from verify if it returns user info
            if (data.user) {
              setAdmin(data.user);
            } else {
              // Fallback to local storage if verify doesn't return user details (though we implemented it to return them)
              try {
                const storedUser = localStorage.getItem('adminUser');
                if (storedUser) setAdmin(JSON.parse(storedUser));
              } catch { }
            }
            setAuthChecked(true);
          });
        } else {
          throw new Error('Token invalid');
        }
      } catch {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
      }
    };

    verifyToken();
  }, [isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  // For login page, render without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      ),
    },
    {
      href: '/admin/products',
      label: 'Products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      href: '/admin/categories',
      label: 'Categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      href: '/admin/orders',
      label: 'Orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      href: '/admin/custom-orders',
      label: 'Custom Orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      href: '/admin/subscribers',
      label: 'Subscribers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      href: '/admin/coupons',
      label: 'Coupons',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden fixed inset-0 z-100">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-110 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-120 w-64 ${!sidebarOpen && 'lg:w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} h-screen overflow-hidden`}
      >
        {/* Logo */}
        <div className={`h-16 px-4 border-b border-gray-100 flex items-center ${!sidebarOpen ? 'justify-center' : 'justify-between'}`}>
          <Link
            href="/admin"
            className={`flex items-center justify-center gap-1 ${!sidebarOpen && 'lg:hidden'}`}
          >
            <Image
              src="/glee_logo.png"
              alt="Glee Logo"
              width={32}
              height={32}
              className="object-contain shrink-0"
            />
            <div className={`${!sidebarOpen && 'lg:hidden'}`}>
              <span className="text-2xl font-extrabold text-black tracking-tight" style={{ fontFamily: 'var(--font-figtree)' }}>lee Threads</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-500 hover:text-black transition-colors hidden lg:block"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} />
            </svg>
          </button>
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  } ${!sidebarOpen && 'lg:justify-center lg:px-2'}`}
              >
                {item.icon}
                <span className={`font-medium ${!sidebarOpen && 'lg:hidden'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'lg:justify-center'}`}>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-gray-600 font-medium">{admin?.name?.[0] || 'A'}</span>
            </div>
            <div className={`flex-1 min-w-0 ${!sidebarOpen && 'lg:hidden'}`}>
              <p className="text-black font-medium truncate">{admin?.name}</p>
              <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ${!sidebarOpen && 'lg:px-2'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`font-medium ${!sidebarOpen && 'lg:hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 px-4 lg:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-black rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-black">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Welcome back, {admin?.name?.split(' ')[0] || 'Admin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Store */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">View Store</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
