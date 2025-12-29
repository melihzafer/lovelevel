import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Calendar, UserMinus, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useSync } from '../contexts/SupabaseSyncContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import InvitePartner from '../components/InvitePartner';
import JoinPartner from '../components/JoinPartner';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { AnimatedBackground } from '../components/layout/AnimatedBackground';
import { daysBetween } from '../lib/dateUtils';

export default function Partner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { partnership } = useSync();
  const [activeTab, setActiveTab] = useState<'invite' | 'join'>('invite');
  const [partner, setPartner] = useState<{
    id: string;
    displayName: string;
    email?: string;
    photoUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  // Load partner info when partnership exists
  useEffect(() => {
    async function fetchPartnerInfo() {
      if (!partnership || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Determine which user is the partner (not current user)
      const partnerId = partnership.user1_id === user.id ? partnership.user2_id : partnership.user1_id;

      // Fetch partner profile
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, photo_url')
        .eq('id', partnerId)
        .single();

      if (!error && data) {
        setPartner({
          id: data.id,
          displayName: data.display_name || 'Unknown User',
          email: data.email || undefined,
          photoUrl: data.photo_url || undefined,
        });
      }

      setLoading(false);
    }

    fetchPartnerInfo();
  }, [partnership, user]);

  async function handleDisconnect() {
    if (!partnership || !window.confirm(t.confirmDisconnectPartner || 'Are you sure you want to disconnect from your partner?')) return;

    setDisconnecting(true);

    // Update partnership status to declined (soft delete)
    const { error } = await supabase
      .from('partnerships')
      .update({ status: 'declined' })
      .eq('id', partnership.id);

    if (!error) {
      // Reload page to reflect changes
      window.location.reload();
    } else {
      console.error('Error disconnecting partner:', error);
      alert(t.errorDisconnectingPartner || 'Error disconnecting from partner');
    }

    setDisconnecting(false);
  }

  function calculateDaysTogether(): number {
    if (!partnership?.anniversary_date) return 0;
    return daysBetween(new Date(partnership.anniversary_date), new Date());
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Connected State (Has Partner)
  if (partnership && partner) {
    return (
      <div className="min-h-screen bg-bg-secondary dark:bg-bg-primary relative overflow-hidden transition-colors duration-500 pb-32">
        <AnimatedBackground />
        <div className="relative z-10 py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center"
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.yourPartnership}
            </h1>
          </div>

          {/* Partner Card */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 space-y-6 shadow-xl border border-white/20 dark:border-white/5 ring-1 ring-black/5">
            {/* Partner Info */}
            <div className="flex items-center gap-4">
              {/* Partner Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
                {partner.photoUrl ? (
                  <img
                    src={partner.photoUrl}
                    alt={partner.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  partner.displayName.charAt(0).toUpperCase()
                )}
              </div>

              {/* Partner Details */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {partner.displayName}
                </h2>
                {partner.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {partner.email}
                  </p>
                )}
              </div>

              <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Days Together */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-4 text-center border border-pink-200 dark:border-pink-800">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-pink-600 dark:text-pink-400" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {calculateDaysTogether()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t.daysTogether}
                </div>
              </div>

              {/* Anniversary Date */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
                <Heart className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {partnership.anniversary_date
                    ? new Date(partnership.anniversary_date).toLocaleDateString()
                    : t.notSet}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t.anniversaryDate}
                </div>
              </div>
            </div>

            {/* Sync Status */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <div className="font-semibold text-green-900 dark:text-green-300">
                    {t.realTimeSyncActive}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-400">
                    {t.challengesAndPetSynced}
                  </div>
                </div>
              </div>
            </div>

            {/* Disconnect Button */}
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {disconnecting ? (
                <>
                  <Loader />
                  {t.disconnecting}...
                </>
              ) : (
                <>
                  <UserMinus className="w-4 h-4" />
                  {t.disconnectPartner}
                </>
              )}
            </Button>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              {t.partnershipFeatures}
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>✨ {t.featureSharedChallenges}</li>
              <li>💗 {t.featurePetSync}</li>
              <li>📊 {t.featureCombinedStats}</li>
              <li>🔔 {t.featureRealTimeUpdates}</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
    );
  }

  // No Partner State (Show Invite/Join Tabs)
  return (
    <div className="min-h-screen bg-bg-secondary dark:bg-bg-primary relative overflow-hidden transition-colors duration-500 pb-32">
      <AnimatedBackground />
      <div className="relative z-10 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.connectWithPartner}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.connectDescription}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20 dark:border-white/5 ring-1 ring-black/5">
          <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                activeTab === 'invite'
                  ? 'text-pink-600 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
              }`}
            >
              {activeTab === 'invite' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500"
                />
              )}
              {t.invitePartner}
            </button>

            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                activeTab === 'join'
                  ? 'text-pink-600 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
              }`}
            >
              {activeTab === 'join' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500"
                />
              )}
              {t.joinPartner}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'invite' ? (
                <motion.div
                  key="invite"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <InvitePartner />
                </motion.div>
              ) : (
                <motion.div
                  key="join"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <JoinPartner />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}

