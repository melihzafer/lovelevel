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
      className="w-[1080px] h-[1920px] bg-white relative overflow-hidden flex flex-col items-center justify-between p-24 text-center font-sans"
      style={{
        // Force specific styles for screenshot consistency
        width: '1080px',
        height: '1920px',
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        background: 'linear-gradient(135deg, #fff1f2 0%, #fff 50%, #f3e8ff 100%)', // Hardcoded soft elegant gradient
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[800px] h-[800px] bg-pink-100 rounded-full blur-[120px] opacity-60 mix-blend-multiply"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[900px] h-[900px] bg-purple-100 rounded-full blur-[120px] opacity-60 mix-blend-multiply"></div>
      </div>

      {/* Header - Fake Glass (High Opacity White + Shadow) */}
      <div className="relative z-10 flex flex-col items-center gap-4 mt-24">
         <div className="px-10 py-4 bg-white/90 rounded-full border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
           <span className="text-2xl font-bold text-pink-600 tracking-[0.2em] uppercase">
             Love Level Journey
           </span>
         </div>
         
         <div className="flex items-center gap-6 mt-4">
           <span className="text-5xl font-bold text-slate-800 tracking-tight">{partner1Name}</span>
           <span className="text-4xl filter drop-shadow-lg">❤️</span>
           <span className="text-5xl font-bold text-slate-800 tracking-tight">{partner2Name}</span>
         </div>
         <p className="text-xl text-slate-500 font-medium tracking-wide layer-shadow">Since {startDate}</p>
      </div>

      {/* Main Stats - Premium Centerpiece */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-16 w-full scale-110">
        {/* Days Circle - "Coin" Style */}
        <div className="relative w-[650px] h-[650px] flex items-center justify-center">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl"></div>
            
            {/* Main Circle - Solid semi-transparent background to mimic glass */}
            <div className="relative w-full h-full bg-white/95 rounded-full border-[10px] border-white/50 shadow-[0_20px_50px_rgba(231,80,122,0.15)] flex flex-col items-center justify-center p-12">
                <div className="flex flex-col items-center">
                    <span className="text-[200px] font-black text-slate-800 leading-[0.85] tracking-tighter">
                        {dateStats.daysTogether}
                    </span>
                    <span className="text-4xl font-bold text-pink-500 tracking-[0.3em] uppercase mt-8 border-t-2 border-pink-100 pt-6 w-32 text-center">Days</span>
                    <span className="text-2xl text-slate-400 font-medium mt-3 uppercase tracking-widest">Together</span>
                </div>
            </div>
            
            {/* Decorations */}
            <div className="absolute top-0 right-14 text-8xl drop-shadow-xl animate-pulse">✨</div>
            <div className="absolute bottom-10 left-10 text-7xl drop-shadow-xl">💖</div>
        </div>

        {/* Secondary Stats - Cards */}
        <div className="grid grid-cols-2 gap-6 w-full max-w-4xl px-8">
            <div className="bg-white/90 rounded-[2.5rem] p-10 border border-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center gap-2">
                <p className="text-8xl font-bold text-purple-600 leading-none">{dateStats.monthsTogether}</p>
                <p className="text-xl font-bold text-slate-400 uppercase tracking-wider">Months</p>
            </div>
            {dateStats.yearsTogether > 0 ? (
                <div className="bg-white/90 rounded-[2.5rem] p-10 border border-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center gap-2">
                    <p className="text-8xl font-bold text-pink-500 leading-none">{dateStats.yearsTogether}</p>
                    <p className="text-xl font-bold text-slate-400 uppercase tracking-wider">Years</p>
                </div>
            ) : (
                 <div className="bg-white/90 rounded-[2.5rem] p-10 border border-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center gap-2">
                    <p className="text-6xl font-bold text-indigo-500 leading-none">Forever</p>
                    <p className="text-xl font-bold text-slate-400 uppercase tracking-wider">To Go</p>
                </div>
            )}
            
            <div className="bg-gradient-to-br from-white/95 to-white/90 rounded-[2.5rem] p-10 border border-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] col-span-2 flex flex-row items-center justify-between px-16">
                <div className="text-left">
                    <p className="text-lg font-bold text-pink-400 uppercase tracking-widest mb-1">Next Milestone</p>
                    <p className="text-5xl font-bold text-slate-700">
                        {dateStats.nextMilestone.value} {dateStats.nextMilestone.type === 'years' ? 'Year Anniversary' : 'Months'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-6xl font-black text-slate-800">{dateStats.nextMilestone.daysUntil}</p>
                    <p className="text-xl font-medium text-slate-400">days to go</p>
                </div>
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
