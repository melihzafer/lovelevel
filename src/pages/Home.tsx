import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDateStats, useSettingsStore } from '../store';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { AnimatedBackground } from '../components/layout/AnimatedBackground';
import Confetti from '../components/Confetti';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { useTranslation } from '../lib/i18n';
import { ShareCard } from '../components/ShareCard';
import html2canvas from 'html2canvas';

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-effect rounded-3xl p-8 text-center relative overflow-hidden group perspective-1000"
    >
      <div style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
      
      {/* Dynamic Shine Effect */}
      <motion.div 
        style={{
            background: useTransform(
                mouseX, 
                [-0.5, 0.5], 
                [
                    "linear-gradient(to right, transparent 0%, rgba(255,255,255,0) 100%)",
                    "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 100%)"
                ] 
            ),
            opacity: useTransform(mouseX, [-0.5, 0, 0.5], [0, 0.5, 0])
        }}
        className="absolute inset-0 z-20 pointer-events-none" 
      />
    </motion.div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dateStats = useDateStats();
  const { settings } = useSettingsStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownTodayCelebration, setHasShownTodayCelebration] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Get partner names from settings
  const partner1Name = settings.partners[0]?.name || t.partner1 || 'Partner 1';
  const partner2Name = settings.partners[1]?.name || t.partner2 || 'Partner 2';
  
  // Show greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning || 'Good Morning';
    if (hour < 18) return t.goodAfternoon || 'Good Afternoon';
    return t.goodEvening || 'Good Evening';
  };

  useEffect(() => {
    // Check if we should show celebration on load
    if (dateStats?.isMonthiversaryToday && !hasShownTodayCelebration) {
      setShowCelebration(true);
      setHasShownTodayCelebration(true);
    }
  }, [dateStats?.isMonthiversaryToday, hasShownTodayCelebration]);

  useEffect(() => {
    // Update counter at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      window.location.reload();
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    
    setIsSharing(true);
    
    try {
      // 1. Capture the hidden ShareCard
      // Reduced scale to 1 for mobile stability (1080x1920 is already HD)
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 1, 
        backgroundColor: null,
        useCORS: true, 
        logging: false,
        allowTaint: true, // Allow cross-origin images if CORS fails (might accept but not share)
      });

      // 2. Convert to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png', 0.9);
      });

      if (!blob) throw new Error('Failed to generate image');

      // 3. Create file for sharing
      const file = new File([blob], 'love_journey.png', { type: 'image/png' });

      // 4. Share using Web Share API
      const shareData = {
          files: [file],
          title: 'Our Love Journey',
          text: `Celebrating ${dateStats?.daysTogether} days together! 💕 #LoveLevel`,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Download the image
        // Create a link and click it immediately
        const link = document.createElement('a');
        link.download = `love_level_${dateStats?.daysTogether}_days.png`;
        link.href = canvas.toDataURL('image/png', 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Share failed:', err);
      // Show user feedback (could add a toast here, but alert is better than silence for now)
      alert(t.shareFailed || 'Could not share image. Try taking a screenshot!'); 

      // Fallback text share if image fail
      if (navigator.share) {
         try {
           await navigator.share({
             title: 'Love Level',
             text: `We've been together for ${dateStats?.daysTogether} days! 💕`,
             url: window.location.href,
           });
         } catch (shareErr) {
           console.error('Fallback share failed:', shareErr);
         }
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!dateStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary dark:bg-bg-primary relative overflow-hidden transition-colors duration-500 pb-32">
      <AnimatedBackground />

      <div className="max-w-md mx-auto p-6 relative z-10 space-y-8">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="relative">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50 dark:ring-white/10 shadow-md" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary leading-none mb-1">{t.profile}</span>
              <span className="text-sm font-bold text-text-primary leading-none">{user?.user_metadata?.full_name || 'User'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="p-2.5 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-200 shadow-sm border border-white/20"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2.5 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shadow-sm border border-white/20 group"
            >
              <svg className="w-5 h-5 text-text-secondary group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Hero Card - Glassmorphism Centerpiece with 3D Tilt */}
        <TiltCard>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-50"></div>
           
           <h1 className="text-xl font-medium text-text-secondary mb-1 opacity-80">{getGreeting()}</h1>
           <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 mb-6">
             <span>{partner1Name}</span>
             <span className="text-xs text-text-secondary">&</span>
             <span>{partner2Name}</span>
           </div>
 
           <div className="relative py-4">
              <motion.div
               className="text-7xl sm:text-8xl font-black text-gradient drop-shadow-sm tracking-tighter"
               animate={{ scale: [1, 1.02, 1] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {dateStats.daysTogether}
              </motion.div>
              <p className="text-lg font-medium text-text-secondary mt-2 tracking-wide uppercase text-xs">{t.daysTogether}</p>
           </div>
 
           <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20 dark:border-white/5">
              <div>
                 <p className="text-2xl font-bold text-text-primary">{dateStats.monthsTogether}</p>
                 <p className="text-xs text-text-secondary uppercase tracking-wider">{t.months}</p>
              </div>
              {dateStats.yearsTogether > 0 && (
                <div>
                   <p className="text-2xl font-bold text-text-primary">{dateStats.yearsTogether}</p>
                   <p className="text-xs text-text-secondary uppercase tracking-wider">{t.years}</p>
                </div>
              )}
           </div>
        </TiltCard>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-white/5 shadow-sm hover-card flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-1">{t.nextMilestone}</p>
              <p className="text-lg font-semibold text-text-primary">
                {dateStats.nextMilestone.value} {dateStats.nextMilestone.type === 'years' ? t.yearAnniversary : t.monthsTogether}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {new Date(dateStats.nextMilestone.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="bg-primary-500 dark:bg-primary-600 text-white px-4 py-2 rounded-xl font-bold text-sm min-w-[80px] text-center shadow-md">
               {dateStats.nextMilestone.daysUntil === 0
                  ? t.today
                  : dateStats.nextMilestone.daysUntil === 1
                    ? t.tomorrow
                    : `${dateStats.nextMilestone.daysUntil}d`}
            </div>
          </motion.div>

          {dateStats.nextMonthiversary && (
             <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-accent-50/80 to-primary-50/80 dark:from-accent-900/20 dark:to-primary-900/20 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-white/5 shadow-sm hover-card flex items-center justify-between"
             >
               <div>
                 <p className="text-xs font-bold text-accent-500 uppercase tracking-wider mb-1">{t.nextMonthiversary}</p>
                 <p className="text-lg font-semibold text-text-primary">
                    {new Date(dateStats.nextMonthiversary).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                 </p>
               </div>
               <span className="text-3xl animate-pulse">💕</span>
             </motion.div>
          )}
        </div>

        {/* Share Button */}
        {'share' in navigator && (
           <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            disabled={isSharing}
            className="w-full py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-dashed border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center justify-center gap-2"
           >
             {isSharing ? (
               <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
             ) : (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
             )}
             {isSharing ? 'Generating...' : t.shareJourney}
           </motion.button>
        )}

        {/* Hidden Share Card for Image Generation */}
        <div className="fixed left-[-9999px] top-[-9999px]">
           <ShareCard ref={shareCardRef} />
        </div>
      </div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <>
            <Confetti />
            <Modal isOpen={showCelebration} onClose={() => setShowCelebration(false)} title="🎉 Happy Monthiversary!">
              <div className="text-center space-y-6 py-4">
                <div className="text-6xl animate-bounce-gentle">💕</div>
                <div>
                   <h3 className="text-2xl font-bold text-text-primary mb-2">
                     {dateStats.monthsTogether} Months!
                   </h3>
                   <p className="text-text-secondary">
                     That's <span className="font-bold text-primary-500">{dateStats.daysTogether} days</span> of an amazing journey together.
                   </p>
                </div>
                <Button onClick={() => setShowCelebration(false)} fullWidth>
                  Celebrate! 🎊
                </Button>
              </div>
            </Modal>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <Modal
            isOpen={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            title={t.logoutConfirm || 'Confirm Logout'}
          >
            <div className="space-y-6 py-2">
              <p className="text-text-secondary text-center">
                {t.logoutMessage || 'Are you sure you want to log out?'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => setShowLogoutConfirm(false)} variant="outline" fullWidth>
                  {t.cancel || 'Cancel'}
                </Button>
                <Button onClick={handleLogout} fullWidth className="bg-red-500 hover:bg-red-600 text-white border-none">
                  {t.auth.logout || 'Logout'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
