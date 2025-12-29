import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, AlertCircle, Check, Heart } from 'lucide-react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { getInviteCodeDetails, acceptInviteCode } from '../services/inviteService';
import { useTranslation } from '../lib/i18n';
import { Button } from './Button';
import { Input } from './Input';
import { Loader } from './Loader';

export default function JoinPartner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [partnerInfo, setPartnerInfo] = useState<{
    displayName: string;
    photoUrl?: string;
  } | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleCodeChange(value: string) {
    const upperCode = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(upperCode);
    setError('');
    setPartnerInfo(null);

    // Auto-validate when 6 characters entered
    if (upperCode.length === 6) {
      await validateCode(upperCode);
    }
  }

  async function validateCode(codeToValidate: string) {
    if (!user) return;

    setValidating(true);
    setError('');

    const result = await getInviteCodeDetails(codeToValidate);

    if (result.valid && result.creator) {
      // Check if trying to use own code
      if (result.creator.id === user.uid) {
        setError(t.cannotUseOwnCode);
        setPartnerInfo(null);
      } else {
        setPartnerInfo({
          displayName: result.creator.displayName,
          photoUrl: result.creator.photoUrl,
        });
      }
    } else {
      setError(result.error || t.invalidInviteCode);
      setPartnerInfo(null);
    }

    setValidating(false);
  }

  async function handleAcceptInvite() {
    if (!user || !partnerInfo) return;

    setAccepting(true);
    setError('');

    const result = await acceptInviteCode(code, user.uid);

    if (result.success) {
      setSuccess(true);
      // Reload page after 2 seconds to refresh partnership state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      setError(result.error || t.failedToAcceptInvite);
    }

    setAccepting(false);
  }

  // Success State
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center"
        >
          <Heart className="w-10 h-10 text-white fill-white" />
        </motion.div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t.partnershipCreated}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t.nowConnectedWith} {partnerInfo?.displayName}!
          </p>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t.refreshingPage}...
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Instructions */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t.joinYourPartner}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t.enterInviteCodeFromPartner}
        </p>
      </div>

      {/* Code Input */}
      <div className="space-y-4">
        <div className="relative">
          <Input
            label={t.inviteCode}
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCodeChange(e.target.value)}
            placeholder="ABC123"
            className="block w-full text-center text-3xl font-mono tracking-[0.5em] uppercase font-bold py-4 bg-gray-50 dark:bg-black/20 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-pink-500 dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
            maxLength={6}
            autoFocus
          />

          {/* Validation Indicator */}
          <AnimatePresence>
            {validating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Loader />
              </motion.div>
            )}

            {code.length === 6 && !validating && partnerInfo && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Partner Preview */}
        <AnimatePresence>
          {partnerInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-white/5 ring-1 ring-black/5"
            >
              <div className="flex items-center gap-4">
                {/* Partner Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                  {partnerInfo.photoUrl ? (
                    <img
                      src={partnerInfo.photoUrl}
                      alt={partnerInfo.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    partnerInfo.displayName.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Partner Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {partnerInfo.displayName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.wantsToConnectWithYou}
                  </p>
                </div>

                <UserPlus className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Accept Button */}
      <AnimatePresence>
        {partnerInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Button
              onClick={handleAcceptInvite}
              disabled={accepting}
              className="w-full flex items-center justify-center gap-2"
            >
              {accepting ? (
                <>
                  <Loader />
                  {t.connecting}...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  {t.acceptAndConnect}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        {t.inviteCodeHelp}
      </div>
    </motion.div>
  );
}

