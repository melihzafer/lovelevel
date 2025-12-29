import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { generateInviteCode, getActiveInviteCode } from '../services/inviteService';
import type { InviteCode } from '../types/database';
import { useTranslation } from '../lib/i18n';
import { Button } from './Button';
import { Loader } from './Loader';

export default function InvitePartner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load existing invite code on mount
  useEffect(() => {
    async function fetchInviteCode() {
      if (!user) return;

      setLoading(true);
      const code = await getActiveInviteCode(user.uid);
      setInviteCode(code);
      setLoading(false);
    }

    fetchInviteCode();
  }, [user]);

  async function handleGenerateCode() {
    if (!user) return;

    setGenerating(true);
    const result = await generateInviteCode(user.uid);

    if (result) {
      setInviteCode({
        code: result.code,
        created_by: user.uid,
        created_at: new Date().toISOString(),
        expires_at: result.expiresAt,
        used: false,
      });
    }

    setGenerating(false);
  }

  function handleCopyCode() {
    if (!inviteCode) return;

    navigator.clipboard.writeText(inviteCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareCode() {
    if (!inviteCode) return;

    const shareText = `Join me on LoveLevel! Use my invite code: ${inviteCode.code}\n\nDownload: ${window.location.origin}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Join me on LoveLevel',
          text: shareText,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function getTimeRemaining(): string {
    if (!inviteCode) return '';

    const expiresAt = new Date(inviteCode.expires_at);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} ${t.days} ${diffHours} ${t.hours}`;
    } else if (diffHours > 0) {
      return `${diffHours} ${t.hours}`;
    } else {
      return t.expiringSoon;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
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
          {t.inviteYourPartner}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t.shareCodeWithPartner}
        </p>
      </div>

      {/* Invite Code Display */}
      {inviteCode ? (
        <div className="space-y-4">
          {/* Code Card */}
          <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-8 border border-white/20 dark:border-white/5 ring-1 ring-black/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-center space-y-4 relative z-10">
              <div className="text-5xl font-bold tracking-wider text-pink-600 dark:text-pink-400 font-mono drop-shadow-sm">
                {inviteCode.code}
              </div>

              {/* Expiry Info */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  {t.expiresIn}: {getTimeRemaining()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? t.copied : t.copyCode}
            </Button>

            <Button
              variant="outline"
              onClick={handleShareCode}
              className="flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              {t.shareCode}
            </Button>
          </div>

          {/* Regenerate Button */}
          <Button
            variant="ghost"
            onClick={handleGenerateCode}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {t.generateNewCode}
          </Button>
        </div>
      ) : (
        /* Generate First Code */
        <div className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t.noActiveInviteCode}
          </p>

          <Button
            onClick={handleGenerateCode}
            disabled={generating}
            className="flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t.generating}
              </>
            ) : (
              t.generateInviteCode
            )}
          </Button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          {t.tips}
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• {t.inviteTip1}</li>
          <li>• {t.inviteTip2}</li>
          <li>• {t.inviteTip3}</li>
        </ul>
      </div>
    </motion.div>
  );
}

