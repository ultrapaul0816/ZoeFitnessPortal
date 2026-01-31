import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

const PAGE_NAMES: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/courses': 'My Courses',
  '/community': 'Community',
  '/profile': 'Profile',
  '/profile/settings': 'Profile Settings',
  '/workouts': 'Workouts',
  '/today': 'Today\'s Workout',
  '/progress': 'Progress',
  '/nutrition': 'Nutrition',
  '/faq': 'FAQ',
  '/educational': 'Educational',
};

function getPageName(path: string): string {
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  
  if (path.startsWith('/courses/')) return 'Course View';
  if (path.startsWith('/community/')) return 'Community Post';
  if (path.startsWith('/workouts/week')) return 'Week Workouts';
  if (path.startsWith('/admin')) return 'Admin';
  
  return path.replace(/^\//, '').replace(/-/g, ' ') || 'Home';
}

export function useActivityTracking() {
  const [location] = useLocation();
  const lastTrackedPath = useRef<string>('');

  const trackPageView = useCallback(async (page: string) => {
    try {
      await apiRequest('POST', '/api/track', {
        type: 'page_view',
        page,
        metadata: {
          url: window.location.pathname,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
    }
  }, []);

  const trackFeature = useCallback(async (feature: string, metadata?: Record<string, any>) => {
    try {
      await apiRequest('POST', '/api/track', {
        type: 'feature_usage',
        feature,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
    }
  }, []);

  useEffect(() => {
    if (location !== lastTrackedPath.current && !location.startsWith('/admin')) {
      lastTrackedPath.current = location;
      const pageName = getPageName(location);
      trackPageView(pageName);
    }
  }, [location, trackPageView]);

  return { trackFeature };
}

export function useTrackFeature() {
  const { trackFeature } = useActivityTracking();
  return trackFeature;
}
