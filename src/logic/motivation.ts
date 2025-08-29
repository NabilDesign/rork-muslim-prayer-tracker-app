import { Badge } from '@/src/store/app-store';
import { Stats } from '@/src/logic/stats';

export const getBadgesForUser = (stats: Stats, existingBadges: Badge[]): Badge[] => {
  const newBadges: Badge[] = [];
  const existingBadgeIds = new Set(existingBadges.map(b => b.id));

  // Streak badges
  const streakBadges = [
    { days: 3, title: 'First Steps', description: '3 days of complete prayers', icon: '🌱', color: '#10B981' },
    { days: 7, title: 'Week Warrior', description: '7 days straight!', icon: '⭐', color: '#F59E0B' },
    { days: 14, title: 'Two Weeks Strong', description: '14 days of dedication', icon: '🔥', color: '#EF4444' },
    { days: 30, title: 'Month Master', description: '30 days of consistency', icon: '👑', color: '#8B5CF6' },
    { days: 100, title: 'Century Club', description: '100 days of prayers!', icon: '💎', color: '#06B6D4' },
  ];

  streakBadges.forEach(badge => {
    const badgeId = `streak_${badge.days}`;
    if (stats.currentStreak >= badge.days && !existingBadgeIds.has(badgeId)) {
      newBadges.push({
        id: badgeId,
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        earnedAt: new Date().toISOString(),
        color: badge.color,
      });
    }
  });

  // On-time rate badges
  const rateBadges = [
    { rate: 0.5, title: 'Getting Started', description: '50% prayers on time', icon: '🎯', color: '#10B981' },
    { rate: 0.75, title: 'Consistent Worshipper', description: '75% prayers on time', icon: '🏆', color: '#F59E0B' },
    { rate: 0.9, title: 'Punctual Prayer', description: '90% prayers on time', icon: '⏰', color: '#EF4444' },
    { rate: 0.95, title: 'Near Perfect', description: '95% prayers on time', icon: '✨', color: '#8B5CF6' },
  ];

  rateBadges.forEach(badge => {
    const badgeId = `rate_${Math.round(badge.rate * 100)}`;
    if (stats.onTimeRate >= badge.rate && !existingBadgeIds.has(badgeId)) {
      newBadges.push({
        id: badgeId,
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        earnedAt: new Date().toISOString(),
        color: badge.color,
      });
    }
  });

  // Special prayer badges
  Object.entries(stats.perPrayerStats).forEach(([prayer, rate]) => {
    if (rate >= 0.8) {
      const badgeId = `${prayer.toLowerCase()}_master`;
      if (!existingBadgeIds.has(badgeId)) {
        newBadges.push({
          id: badgeId,
          title: `${prayer} Master`,
          description: `80% ${prayer} prayers on time`,
          icon: prayer === 'Fajr' ? '🌅' : prayer === 'Dhuhr' ? '☀️' : prayer === 'Asr' ? '🌤️' : prayer === 'Maghrib' ? '🌅' : '🌙',
          earnedAt: new Date().toISOString(),
          color: '#3B82F6',
        });
      }
    }
  });

  return newBadges;
};

export const getMotivationalMessage = (stats: Stats): string => {
  const messages = {
    highStreak: [
      `Amazing ${stats.currentStreak}-day streak! Keep the momentum going! 🔥`,
      `${stats.currentStreak} days strong! Your dedication is inspiring! ⭐`,
      `Subhan'Allah! ${stats.currentStreak} consecutive days of prayers! 🤲`,
    ],
    mediumStreak: [
      `Great work on your ${stats.currentStreak}-day streak! 💪`,
      `${stats.currentStreak} days of consistent prayers! Keep it up! 🌟`,
      `Your ${stats.currentStreak}-day journey is beautiful! 🌱`,
    ],
    lowStreak: [
      'Every prayer is a step closer to Allah 🤲',
      'Consistency is key. You\'re building a beautiful habit! 🌱',
      'Each prayer is a blessing. Keep going! ⭐',
    ],
    noStreak: [
      'Today is a new beginning. Start fresh! 🌅',
      'Every moment is a chance to reconnect with Allah 🤲',
      'Your spiritual journey starts with a single prayer 🌟',
    ],
  };

  let category: keyof typeof messages;
  if (stats.currentStreak >= 7) category = 'highStreak';
  else if (stats.currentStreak >= 3) category = 'mediumStreak';
  else if (stats.currentStreak >= 1) category = 'lowStreak';
  else category = 'noStreak';

  const categoryMessages = messages[category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
};