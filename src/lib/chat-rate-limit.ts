interface UserChatUsage {
  count: number;
  resetAt: number;
}

const chatUsage = new Map<string, UserChatUsage>();
const DAILY_LIMIT = 5;

// Cleanup every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, usage] of chatUsage) {
    if (now > usage.resetAt) {
      chatUsage.delete(key);
    }
  }
}, 30 * 60 * 1000);

function getNextMidnightWIB(): number {
  const now = new Date();
  // Midnight WIB (UTC+7) = 17:00 UTC previous day
  const wib = new Date(now.getTime());
  wib.setUTCHours(17, 0, 0, 0); // 00:00 WIB = 17:00 UTC
  if (wib.getTime() <= now.getTime()) {
    wib.setUTCDate(wib.getUTCDate() + 1);
  }
  return wib.getTime();
}

export function checkChatLimit(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const usage = chatUsage.get(userId);
  const resetAt = getNextMidnightWIB();

  // New day or first use
  if (!usage || now > usage.resetAt) {
    chatUsage.set(userId, { count: 1, resetAt });
    return { allowed: true, remaining: DAILY_LIMIT - 1, resetAt };
  }

  // Rate limited
  if (usage.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: usage.resetAt };
  }

  // Increment
  usage.count++;
  return { allowed: true, remaining: DAILY_LIMIT - usage.count, resetAt: usage.resetAt };
}
