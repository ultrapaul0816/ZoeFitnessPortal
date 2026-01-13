import { useState, useEffect } from "react";
import { X, Clock, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";

interface ExpiryNotificationProps {
  user: User;
}

type ExpiryType = 'whatsapp_expiring' | 'whatsapp_expired' | 'program_expiring' | 'program_expired';

interface ExpiryInfo {
  type: ExpiryType;
  daysRemaining: number;
  expiryDate: Date;
}

const PAYMENT_LINK = 'https://rzp.io/rzp/sFzniAWK';

export default function ExpiryNotification({ user }: ExpiryNotificationProps) {
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);
  const [expiryInfos, setExpiryInfos] = useState<ExpiryInfo[]>([]);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('dismissedExpiryNotifications');
    if (dismissed) {
      setDismissedNotifications(JSON.parse(dismissed));
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const infos: ExpiryInfo[] = [];

    if (user.whatsAppSupportExpiryDate) {
      const whatsAppExpiry = new Date(user.whatsAppSupportExpiryDate);
      const daysRemaining = Math.ceil((whatsAppExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (whatsAppExpiry < now) {
        infos.push({ type: 'whatsapp_expired', daysRemaining, expiryDate: whatsAppExpiry });
      } else if (whatsAppExpiry <= sevenDaysFromNow) {
        infos.push({ type: 'whatsapp_expiring', daysRemaining, expiryDate: whatsAppExpiry });
      }
    }

    if (user.validUntil) {
      const programExpiry = new Date(user.validUntil);
      const daysRemaining = Math.ceil((programExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (programExpiry < now) {
        infos.push({ type: 'program_expired', daysRemaining, expiryDate: programExpiry });
      } else if (programExpiry <= sevenDaysFromNow) {
        infos.push({ type: 'program_expiring', daysRemaining, expiryDate: programExpiry });
      }
    }

    setExpiryInfos(infos);
  }, [user]);

  const dismissNotification = (type: ExpiryType) => {
    const updated = [...dismissedNotifications, type];
    setDismissedNotifications(updated);
    sessionStorage.setItem('dismissedExpiryNotifications', JSON.stringify(updated));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getNotificationContent = (info: ExpiryInfo) => {
    const firstName = user.firstName || 'there';

    switch (info.type) {
      case 'whatsapp_expiring':
        return {
          title: 'WhatsApp Support Expiring Soon',
          icon: <Clock className="w-5 h-5" />,
          isExpired: false,
          message: `Hey ${firstName}! Your WhatsApp Community Support expires on ${formatDate(info.expiryDate)} (${info.daysRemaining} day${info.daysRemaining === 1 ? '' : 's'} left).`,
          subMessage: `Your access will be revoked on ${formatDate(info.expiryDate)}. Renew now to keep access to Coach Zoe and our supportive community.`,
          buttonText: 'Renew Now',
        };
      case 'whatsapp_expired':
        return {
          title: 'WhatsApp Support Expired',
          icon: <Sparkles className="w-5 h-5" />,
          isExpired: true,
          message: `Hey ${firstName}, your WhatsApp Community Support expired on ${formatDate(info.expiryDate)}.`,
          subMessage: `Your program access is still active. Renew to rejoin the WhatsApp group and get Coach Zoe's support again!`,
          buttonText: 'Renew Access',
        };
      case 'program_expiring':
        return {
          title: 'Program Access Expiring Soon',
          icon: <Clock className="w-5 h-5" />,
          isExpired: false,
          message: `Hey ${firstName}! Your Heal Your Core program expires on ${formatDate(info.expiryDate)} (${info.daysRemaining} day${info.daysRemaining === 1 ? '' : 's'} left).`,
          subMessage: `Your workout access will be revoked on ${formatDate(info.expiryDate)}. Renew to continue your recovery journey.`,
          buttonText: 'Renew Now',
        };
      case 'program_expired':
        return {
          title: 'Program Access Expired',
          icon: <Sparkles className="w-5 h-5" />,
          isExpired: true,
          message: `Hey ${firstName}, your Heal Your Core program expired on ${formatDate(info.expiryDate)}.`,
          subMessage: `Renew to get back your workout access and continue your postpartum recovery!`,
          buttonText: 'Renew Access',
        };
    }
  };

  const activeNotifications = expiryInfos.filter(info => !dismissedNotifications.includes(info.type));

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-300">
        {activeNotifications.map((info) => {
          const content = getNotificationContent(info);
          return (
            <div
              key={info.type}
              className="relative overflow-hidden rounded-3xl bg-white shadow-2xl"
              style={{ boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.25)' }}
            >
              {/* Decorative top gradient bar */}
              <div className="h-1.5 bg-gradient-to-r from-pink-400 via-rose-500 to-pink-600" />
              
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    {content.icon}
                  </div>
                  <span className="font-bold text-base tracking-wide">{content.title}</span>
                </div>
                <button
                  onClick={() => dismissNotification(info.type)}
                  className="text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-full"
                  aria-label="Dismiss notification"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-800 text-base leading-relaxed font-medium">
                  {content.message}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  {content.subMessage}
                </p>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 transition-all duration-200 hover:scale-[1.02] rounded-xl"
                    onClick={() => window.open(PAYMENT_LINK, '_blank')}
                  >
                    {content.buttonText}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 px-6 border-2 border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 font-medium transition-all duration-200 rounded-xl"
                    onClick={() => dismissNotification(info.type)}
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>

              {/* Decorative bottom element */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-rose-200 to-pink-200 opacity-50" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
