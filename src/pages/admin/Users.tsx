import { useState } from 'react';
import { Users, Search, ChevronDown } from 'lucide-react';
import { useAdminUsers, useUpdateUserRole } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const ROLE_TABS = [
  { label: 'All', value: '' },
  { label: 'Travellers', value: 'traveller' },
  { label: 'Hosts', value: 'host' },
  { label: 'Admins', value: 'admin' },
];

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-purple-50 text-purple-700 border border-purple-200',
  host: 'bg-blue-50 text-blue-700 border border-blue-200',
  traveller: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const ROLE_OPTIONS: UserRole[] = ['traveller', 'host', 'admin'];

interface RoleDropdownProps {
  userId: string;
  currentRole: UserRole;
}

function RoleDropdown({ userId, currentRole }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<UserRole | null>(null);
  const updateRole = useUpdateUserRole();

  function handleSelect(role: UserRole) {
    if (role === currentRole) { setOpen(false); return; }
    setConfirming(role);
    setOpen(false);
  }

  function handleConfirm() {
    if (!confirming) return;
    updateRole.mutate({ id: userId, role: confirming }, {
      onSuccess: () => setConfirming(null),
    });
  }

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors',
            ROLE_STYLES[currentRole],
          )}
        >
          {currentRole}
          <ChevronDown size={11} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-warm-200 rounded-xl shadow-lg py-1 min-w-[120px]">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => handleSelect(r)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-warm-50',
                    r === currentRole ? 'text-warm-400' : 'text-navy-950',
                  )}
                >
                  {r}
                  {r === currentRole && ' (current)'}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirm dialog */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-heading text-base font-semibold text-navy-950 mb-2">Change Role</h3>
            <p className="text-sm text-warm-600 mb-5">
              Change this user's role from{' '}
              <span className="font-semibold text-navy-950">{currentRole}</span> to{' '}
              <span className="font-semibold text-navy-950">{confirming}</span>?
              This will affect what they can access immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 h-10 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={updateRole.isPending}
                className="flex-1 h-10 rounded-xl bg-navy-950 hover:bg-navy-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {updateRole.isPending ? 'Updating…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);

  // Simple debounce via timeout stored in state
  function handleSearchChange(val: string) {
    setSearch(val);
    clearTimeout((window as unknown as Record<string, unknown>)._userSearchTimeout as number);
    (window as unknown as Record<string, unknown>)._userSearchTimeout = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(0);
    }, 350);
  }

  const { data, isLoading } = useAdminUsers({
    role: roleFilter || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  });

  const users = data?.results ?? [];

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Users"
        description="Manage user accounts and roles across the platform."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-warm-200 bg-white text-sm text-navy-950 placeholder:text-warm-400 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setRoleFilter(tab.value); setPage(0); }}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors',
                roleFilter === tab.value
                  ? 'bg-navy-950 text-white'
                  : 'bg-white border border-warm-200 text-warm-700 hover:border-warm-300',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-warm-100 animate-pulse bg-warm-50" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={debouncedSearch ? `No users matching "${debouncedSearch}"` : 'No users on the platform yet.'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1fr_120px_120px] gap-4 px-5 py-3 bg-warm-50 border-b border-warm-200 text-xs font-semibold text-warm-500 uppercase tracking-wide">
            <span>User</span>
            <span>Email</span>
            <span>Joined</span>
            <span className="text-right">Role</span>
          </div>

          <div className="divide-y divide-warm-100">
            {users.map((u) => {
              const initials = u.full_name
                ? u.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                : u.email[0].toUpperCase();

              return (
                <div key={u.id} className="px-5 py-3.5">
                  {/* Mobile */}
                  <div className="md:hidden flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-navy-700">{initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy-950 truncate">{u.full_name ?? '—'}</p>
                        <p className="text-xs text-warm-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <RoleDropdown userId={u.id} currentRole={u.role} />
                  </div>

                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-[1fr_1fr_120px_120px] gap-4 items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-navy-700">{initials}</span>
                      </div>
                      <p className="text-sm font-medium text-navy-950 truncate">{u.full_name ?? '—'}</p>
                    </div>
                    <p className="text-sm text-warm-600 truncate">{u.email}</p>
                    <p className="text-sm text-warm-500">{formatDate(u.created_at)}</p>
                    <div className="flex justify-end">
                      <RoleDropdown userId={u.id} currentRole={u.role} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {(data?.totalCount ?? 0) > 20 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-warm-100">
              <p className="text-xs text-warm-500">
                Showing {page * 20 + 1}–{Math.min((page + 1) * 20, data!.totalCount)} of {data!.totalCount}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="h-8 px-3 rounded-lg border border-warm-200 text-xs font-medium text-warm-700 hover:bg-warm-50 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data?.hasNextPage}
                  className="h-8 px-3 rounded-lg border border-warm-200 text-xs font-medium text-warm-700 hover:bg-warm-50 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
