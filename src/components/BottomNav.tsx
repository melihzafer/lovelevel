import { NavLink } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';
import { Home, Trophy, Heart, Dog, Settings } from 'lucide-react';

export function BottomNav() {
  const { t } = useTranslation();
  
  const navItems = [
    { path: '/', label: t.navHome, Icon: Home },
    { path: '/challenges', label: t.navChallenges, Icon: Trophy },
    { path: '/partner', label: t.navPartner, Icon: Heart },
    { path: '/pet', label: t.navPet, Icon: Dog },
    { path: '/settings', label: t.navSettings, Icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none mb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="glass-effect rounded-2xl flex justify-around items-center h-16 w-full max-w-md px-2 shadow-2xl pointer-events-auto ring-1 ring-white/20 dark:ring-white/5">
        {navItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `relative group flex flex-col items-center justify-center w-full h-full touch-target transition-all duration-300 ${
                isActive ? '-translate-y-1' : ''
              }`
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <div className={`
                  p-1.5 rounded-xl transition-all duration-300 relative
                  ${isActive ? 'bg-primary-50 dark:bg-primary-900/40' : 'bg-transparent'}
                `}>
                  {isActive && (
                    <div className="absolute inset-0 bg-primary-400/20 blur-md rounded-xl" />
                  )}
                  <Icon 
                    className={`w-6 h-6 transition-transform duration-300 relative z-10 ${isActive ? 'scale-110 text-primary-500 dark:text-primary-400' : 'group-hover:scale-110 text-gray-400 dark:text-gray-500'}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                </div>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-primary-500 rounded-full animate-bounce" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
