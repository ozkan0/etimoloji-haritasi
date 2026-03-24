export const trackEvent = (eventType: string, eventData: any = {}) => {
  if (typeof window === 'undefined') return;

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      eventData,
      userAgent: window.navigator.userAgent,
    }),
    keepalive: true,
  }).catch(() => {});
};
