import { useState, useEffect } from "react";
import { X, AlertTriangle, Clock, ExternalLink } from "lucide-react";
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
    // Check for dismissed notifications in sessionStorage (resets on new session/login)
    const dismissed = sessionStorage.getItem('dismissedExpiryNotifications');
    if (dismissed) {
      setDismissedNotifications(JSON.parse(dismissed));
    }

    // Calculate expiry info
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const infos: ExpiryInfo[] = [];

    // Check WhatsApp expiry
    if (user.whatsAppSupportExpiryDate) {
      const whatsAppExpiry = new Date(user.whatsAppSupportExpiryDate);
      const daysRemaining = Math.ceil((whatsAppExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (whatsAppExpiry < now) {
        infos.push({ type: 'whatsapp_expired', daysRemaining, expiryDate: whatsAppExpiry });
      } else if (whatsAppExpiry <= sevenDaysFromNow) {
        infos.push({ type: 'whatsapp_expiring', daysRemaining, expiryDate: whatsAppExpiry });
      }
    }

    // Check Program expiry
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
          gradient: 'from-amber-500 to-orange-500',
          bgGradient: 'from-amber-50 to-orange-50',
          borderColor: 'border-amber-200',
          message: `Hey ${firstName}! Your WhatsApp Community Support expires on ${formatDate(info.expiryDate)} (${info.daysRemaining} day${info.daysRemaining === 1 ? '' : 's'} left). Renew to keep access to Coach Zoe and our community.`,
          buttonText: 'Renew Now',
        };
      case 'whatsapp_expired':
        return {
          title: 'WhatsApp Support Expired',
          icon: <AlertTriangle className="w-5 h-5" />,
          gradient: 'from-red-500 to-rose-500',
          bgGradient: 'from-red-50 to-rose-50',
          borderColor: 'border-red-200',
          message: `Hey ${firstName}, your WhatsApp Community Support expired on ${formatDate(info.expiryDate)}. Your program access is still active. Renew to rejoin the WhatsApp group!`,
          buttonText: 'Renew Access',
        };
      case 'program_expiring':
        return {
          title: 'Program Access Expiring Soon',
          icon: <Clock className="w-5 h-5" />,
          gradient: 'from-amber-500 to-orange-500',
          bgGradient: 'from-amber-50 to-orange-50',
          borderColor: 'border-amber-200',
          message: `Hey ${firstName}! Your Heal Your Core program expires on ${formatDate(info.expiryDate)} (${info.daysRemaining} day${info.daysRemaining === 1 ? '' : 's'} left). Renew to keep your workouts going.`,
          buttonText: 'Renew Now',
        };
      case 'program_expired':
        return {
          title: 'Program Access Expired',
          icon: <AlertTriangle className="w-5 h-5" />,
          gradient: 'from-red-500 to-rose-500',
          bgGradient: 'from-red-50 to-rose-50',
          borderColor: 'border-red-200',
          message: `Hey ${firstName}, your Heal Your Core program expired on ${formatDate(info.expiryDate)}. Renew to get back your workout access!`,
          buttonText: 'Renew Access',
        };
    }
  };

  // Filter out dismissed notifications
  const activeNotifications = expiryInfos.filter(info => !dismissedNotifications.includes(info.type));

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeNotifications.map((info) => {
          const content = getNotificationContent(info);
          return (
            <div
              key={info.type}
              className={`relative overflow-hidden rounded-2xl border ${content.borderColor} bg-gradient-to-br ${content.bgGradient} shadow-xl`}
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${content.gradient} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2 text-white">
                  {content.icon}
                  <span className="font-semibold text-sm">{content.title}</span>
                </div>
                <button
                  onClick={() => dismissNotification(info.type)}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {content.message}
                </p>

                <div className="flex gap-3">
                  <Button
                    className={`flex-1 bg-gradient-to-r ${content.gradient} text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
                    onClick={() => window.open(PAYMENT_LINK, '_blank')}
                  >
                    {content.buttonText}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => dismissNotification(info.type)}
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
