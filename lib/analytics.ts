const recentEventTimes = new Map<string, number>();

export const trackEvent = (eventType: string, eventData: any = {}) => {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;

  const signature = `${eventType}:${JSON.stringify(eventData)}`;
  const now = Date.now();
  const last = recentEventTimes.get(signature);
  if (last && now - last < 4000) {
    return;
  }
  recentEventTimes.set(signature, now);

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
