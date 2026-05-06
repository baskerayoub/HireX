import { useState } from 'react';
import EmptyState from '../../components/ui/EmptyState';
import { ShieldCheck, Search } from 'lucide-react';

export default function Users() {
  const [search, setSearch] = useState('');

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Admin panel for managing system users</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-prpl" />
          </div>
        </div>

        <EmptyState
          icon={ShieldCheck}
          title="Admin Panel"
          description="User management features will be available here. Connect to a configured database to view and manage users."
        />
      </div>
    </>
  );
}
