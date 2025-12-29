import { forwardRef } from 'react';
import { useDateStats, useSettingsStore } from '../store';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useTranslation } from '../lib/i18n';

interface ShareCardProps {
  onLoad?: () => void;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>((_, ref) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dateStats = useDateStats();
  const { settings } = useSettingsStore();

  if (!dateStats || !user) return null;

  const partner1Name = settings.partners[0]?.name || t.partner1 || 'Partner 1';
  const partner2Name = settings.partners[1]?.name || t.partner2 || 'Partner 2';

  // Calculate start date formatted
  const startDate = new Date(settings.relationshipStartDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      ref={ref}
      className="w-[1080px] h-[1920px] bg-gradient-to-br from-[#FFF0F3] via-[#FFF5F7] to-[#FFE4E8] relative overflow-hidden flex flex-col items-center justify-between p-24 text-center font-sans"
      style={{
        // Force specific styles for screenshot consistency
        width: '1080px',
        height: '1920px',
        position: 'fixed',
        top: '-9999px',
        left: '-9999px', // Hide it off-screen
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-60 pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[800px] h-[800px] bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-[150px] opacity-40"></div>
        <div className="absolute bottom-[-200px] right-[-200px] w-[900px] h-[900px] bg-gradient-to-tl from-red-300 to-orange-200 rounded-full blur-[150px] opacity-40"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center gap-6 mt-20">
         <div className="px-8 py-3 bg-white/70 backdrop-blur-xl rounded-full border border-white/40 shadow-sm">
           <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 tracking-wide uppercase">
             Love Level Journey
           </span>
         </div>
         
         <div className="flex items-center gap-6 text-4xl font-semibold text-gray-800">
           <span>{partner1Name}</span>
           <span className="text-3xl text-pink-500">❤️</span>
           <span>{partner2Name}</span>
         </div>
         <p className="text-2xl text-gray-500 font-medium">Since {startDate}</p>
      </div>

      {/* Main Stats - Centerpiece */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-12 w-full">
        {/* Days Circle */}
        <div className="relative w-[700px] h-[700px] flex items-center justify-center">
            {/* Soft glow behind */}
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-purple-200 rounded-full blur-[60px] opacity-50"></div>
            
            {/* Glassmorphism Circle */}
            <div className="relative w-full h-full bg-white/40 backdrop-blur-2xl rounded-full border border-white/60 shadow-2xl flex flex-col items-center justify-center p-12">
                <span className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-600 leading-none">
                    {dateStats.daysTogether}
                </span>
                <span className="text-5xl font-bold text-gray-600 tracking-widest uppercase mt-4">Days</span>
                <span className="text-3xl text-gray-400 font-medium mt-2">Together</span>
            </div>
            
            {/* Orbiting Elements (Simulated with absolute positions) */}
            <div className="absolute top-10 right-20 text-8xl animate-pulse">✨</div>
            <div className="absolute bottom-20 left-10 text-7xl animate-bounce">💕</div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/40 shadow-lg text-center">
                <p className="text-7xl font-bold text-purple-600">{dateStats.monthsTogether}</p>
                <p className="text-2xl font-semibold text-gray-500 mt-2 uppercase">Months</p>
            </div>
            {dateStats.yearsTogether > 0 && (
                <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/40 shadow-lg text-center">
                    <p className="text-7xl font-bold text-pink-500">{dateStats.yearsTogether}</p>
                    <p className="text-2xl font-semibold text-gray-500 mt-2 uppercase">Years</p>
                </div>
            )}
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/40 shadow-lg text-center col-span-2">
                <p className="text-2xl font-bold text-gray-700 uppercase mb-2">Next Milestone</p>
                <p className="text-5xl font-bold text-indigo-500">
                    {dateStats.nextMilestone.value} {dateStats.nextMilestone.type === 'years' ? 'Years' : 'Months'}
                </p>
                <p className="text-xl text-gray-500 mt-2">
                   in {dateStats.nextMilestone.daysUntil} days
                </p>
            </div>
        </div>
      </div>

      {/* Footer / Branding */}
      <div className="relative z-10 mt-auto mb-10 opacity-80">
          <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                  <span className="text-3xl text-white">L</span>
              </div>
              <p className="text-xl font-semibold text-gray-600">lovelevel.app</p>
          </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
