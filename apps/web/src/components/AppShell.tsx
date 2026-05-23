import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ClipboardList, FileCheck2, FilePlus2, FolderKanban, LayoutDashboard, LogOut, Table2, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/quotations', label: 'Quotations', icon: ClipboardList },
  { to: '/quotations/new', label: 'Generate Quotation', icon: FilePlus2 },
  { to: '/approvals', label: 'Approvals', icon: FileCheck2 },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/data', label: 'Data Tables', icon: Table2 },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel flex flex-col justify-between p-6">
          <div>
            <Link to="/" className="block">
              <p className="font-display text-2xl font-bold text-ink">Technovan</p>
              <p className="mt-2 text-sm text-slate-500">Quotation Management System</p>
            </Link>
            <nav className="mt-8 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'}`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          <div className="rounded-3xl bg-sand p-4">
            <p className="text-sm font-semibold text-ink">{user?.fullName}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{user?.role}</p>
            <button
              className="btn-secondary mt-4 w-full gap-2"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>
        <main className="space-y-6">
          <header className="panel flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Operational Command</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-ink">Project Quotation Management</h1>
            </div>
            <div className="rounded-3xl bg-ink px-5 py-4 text-white">
              <p className="text-sm text-white/70">Approval discipline</p>
              <p className="mt-1 text-lg font-semibold">Manager gate enabled before send</p>
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}