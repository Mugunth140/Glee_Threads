'use client';

import dynamic from 'next/dynamic';

const NavbarClient = dynamic(() => import('./NavbarClient'), {
  ssr: false,
  loading: () => (
    <nav className="bg-white sticky top-0 z-50">
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="w-6 h-6 bg-gray-100 rounded"></div>
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
              </div>
              <span className="text-xl font-semibold text-black">Glee Threads</span>
            </div>
            <div className="w-16 h-6 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center h-14 gap-4">
            <div className="w-24 h-8 bg-gray-100 rounded-lg"></div>
            <div className="flex-1 max-w-md h-9 bg-gray-50 rounded-lg"></div>
          </div>
        </div>
      </div>
    </nav>
  ),
});

export default function Navbar() {
  return <NavbarClient />;
}
