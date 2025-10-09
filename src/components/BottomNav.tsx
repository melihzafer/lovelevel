import { NavLink } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';

export function BottomNav() {
  const t = useTranslation();
  
  const navItems = [
    { path: '/', label: t.navHome, icon: '🏠' },
    { path: '/challenges', label: t.navChallenges, icon: '✨' },
    { path: '/pet', label: t.navPet, icon: '🐾' },
    { path: '/history', label: t.navHistory, icon: '📖' },
    { path: '/settings', label: t.navSettings, icon: '⚙️' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border-color z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[60px] min-h-[44px] touch-target transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-text-secondary hover:text-text-primary'
              }`
            }
            aria-label={item.label}
          >
            <span className="text-2xl" aria-hidden="true">
              {item.icon}
            </span>
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
