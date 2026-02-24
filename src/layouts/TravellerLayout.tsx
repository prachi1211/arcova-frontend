import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';

export function TravellerLayout() {
  return (
    <div className="flex h-screen bg-warm-50 overflow-hidden">
      <Sidebar role="traveller" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
