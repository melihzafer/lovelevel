// import { useSettingsStore } from '../../store';

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className = '' }: AnimatedBackgroundProps) {
  // const { settings } = useSettingsStore();
  // const theme = settings.theme;

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}>
      {/* Primary Blob */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 dark:bg-primary-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
      
      {/* Secondary Blob */}
      <div className="absolute top-0 -right-4 w-72 h-72 bg-accent-300 dark:bg-accent-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      
      {/* Tertiary Blob */}
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      
      {/* Extra ambient glow for depth */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-transparent via-primary-50/10 to-transparent dark:via-primary-900/5 opacity-50" />
    </div>
  );
}
