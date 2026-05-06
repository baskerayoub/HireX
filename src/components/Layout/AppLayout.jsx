import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-8 max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
