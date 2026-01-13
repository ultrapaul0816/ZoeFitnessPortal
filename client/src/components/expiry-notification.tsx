import { useState, useEffect } from "react";
import { X, MessageCircle, Dumbbell, ExternalLink, AlertTriangle, Timer } from "lucide-react";
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
          title: 'WhatsApp Community Support',
          headline: 'Expiring Soon!',
          headlineIcon: <Timer className="w-6 h-6 text-white" />,
          icon: <MessageCircle className="w-8 h-8 text-white" />,
          isExpired: false,
          message: `Hey ${firstName}! Your WhatsApp Community Support expires on ${formatDate(info.expiryDate)} (${info.daysRemaining} day${info.daysRemaining === 1 ? '' : 's'} left).`,
          subMessage: `Your access will be revoked on ${formatDate(info.expiryDate)}. Renew now to keep access to Coach Zoe and our supportive community.`,
          buttonText: 'Renew Now',
        };
      case 'whatsapp_expired':
        return {
          title: 'WhatsApp Community Support',
          headline: 'Access Expired!',
          headlineIcon: <AlertTriangle className="w-6 h-6 text-white" />,
          icon: <MessageCircle className="w-8 h-8 text-white" />,
          isExpired: true,
          message: `Hey ${firstName}, your WhatsApp Community Support expired on ${formatDate(info.expiryDate)}.`,
          subMessage: `Your program access is still active. Renew to rejoin the WhatsApp group and get Coach Zoe's support again!`,
          buttonText: 'Renew Access',
        };
      case 'program_expiring':
        return {
          title: 'Heal Your Core Program',
          headline: 'Expiring Soon!',
          headlineIcon: <Timer className="w-6 h-6 text-white" />,
          icon: <Dumbbell className="w-8 h-8 text-white" />,
          isExpired: false,
          message: `Hey ${firstName}! Your Heal Your Core program expires on ${formatDate(info.expiryDate)} (${info.daysRemaining} day${info.daysRemaining === 1 ? '' : 's'} left).`,
          subMessage: `Your workout access will be revoked on ${formatDate(info.expiryDate)}. Renew to continue your recovery journey.`,
          buttonText: 'Renew Now',
        };
      case 'program_expired':
        return {
          title: 'Heal Your Core Program',
          headline: 'Access Expired!',
          headlineIcon: <AlertTriangle className="w-6 h-6 text-white" />,
          icon: <Dumbbell className="w-8 h-8 text-white" />,
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
              {/* Close button - positioned outside the card */}
              <button
                onClick={() => dismissNotification(info.type)}
                className="absolute -top-2 -right-2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 border border-gray-100"
                aria-label="Dismiss notification"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-6 py-8 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />

                <div className="relative z-10 text-center">
                  {/* Main icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm mb-4 shadow-lg border border-white/30">
                    {content.icon}
                  </div>
                  
                  {/* Big headline */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {content.headlineIcon}
                    <h2 className="text-white text-3xl font-extrabold tracking-tight drop-shadow-md">
                      {content.headline}
                    </h2>
                  </div>
                  
                  {/* Subtitle */}
                  <p className="text-white/90 text-base font-semibold">
                    {content.title}
                  </p>
                </div>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
