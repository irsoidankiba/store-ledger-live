import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, PlusCircle, FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/stores', icon: Store, label: 'Magasins' },
  { to: '/add', icon: PlusCircle, label: 'Saisie', adminOnly: true },
  { to: '/owners', icon: Users, label: 'Propriétaires', adminOnly: true },
  { to: '/reports', icon: FileText, label: 'Rapports' },
];

export function MobileNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'mobile-nav-item flex-1',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
