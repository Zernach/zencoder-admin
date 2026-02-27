import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function RootLayout() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
