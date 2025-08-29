import { Badge } from '@/src/store/app-store';
import { Stats } from '@/src/logic/stats';

export const getBadgesForUser = (stats: Stats, existingBadges: Badge[]): Badge[] => {
  const newBadges: Badge[] = [];
  const existingBadgeIds = new Set(existingBadges.map(b => b.id));

  // Streak badges
  const streakBadges = [
    { days: 3, title: 'First Steps', description: '3 days of reflections', icon: '🌱', color: '#10B981' },
    { days: 7, title: 'Week Warrior', description: '7 days straight!', icon: '⭐', color: '#F59E0B' },
    { days: 14, title: 'Two Weeks Strong', description: '14 days of dedication', icon: '🔥', color: '#EF4444' },
    { days: 30, title: 'Month Master', description: '30 days of consistency', icon: '👑', color: '#8B5CF6' },
    { days: 100, title: 'Century Club', description: '100 days of reflections!', icon: '💎', color: '#06B6D4' },
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

  // Completion rate badges
  const rateBadges = [
    { rate: 0.5, title: 'Getting Started', description: '50% completion rate', icon: '🎯', color: '#10B981' },
    { rate: 0.75, title: 'Consistent Reflector', description: '75% completion rate', icon: '🏆', color: '#F59E0B' },
    { rate: 0.9, title: 'Daily Devotion', description: '90% completion rate', icon: '⏰', color: '#EF4444' },
    { rate: 0.95, title: 'Near Perfect', description: '95% completion rate', icon: '✨', color: '#8B5CF6' },
  ];

  rateBadges.forEach(badge => {
    const badgeId = `rate_${Math.round(badge.rate * 100)}`;
    if (stats.completionRate >= badge.rate && !existingBadgeIds.has(badgeId)) {
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

  // Total reflections badges
  const totalBadges = [
    { count: 10, title: 'First Ten', description: '10 reflections written', icon: '📝', color: '#3B82F6' },
    { count: 50, title: 'Half Century', description: '50 reflections completed', icon: '📚', color: '#8B5CF6' },
    { count: 100, title: 'Reflection Master', description: '100 reflections achieved', icon: '🎓', color: '#F59E0B' },
  ];

  totalBadges.forEach(badge => {
    const badgeId = `total_${badge.count}`;
    if (stats.totalReflections >= badge.count && !existingBadgeIds.has(badgeId)) {
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

  return newBadges;
};

export const getMotivationalMessage = (stats: Stats): string => {
  const messages = {
    highStreak: [
      `Amazing ${stats.currentStreak}-day streak! Keep the momentum going! 🔥`,
      `${stats.currentStreak} days strong! Your dedication is inspiring! ⭐`,
      `Subhan'Allah! ${stats.currentStreak} consecutive days of reflection! 🤲`,
    ],
    mediumStreak: [
      `Great work on your ${stats.currentStreak}-day streak! 💪`,
      `${stats.currentStreak} days of consistent reflection! Keep it up! 🌟`,
      `Your ${stats.currentStreak}-day journey is beautiful! 🌱`,
    ],
    lowStreak: [
      'Every reflection brings you closer to Allah 🤲',
      'Consistency is key. You\'re building a beautiful habit! 🌱',
      'Each reflection is a blessing. Keep going! ⭐',
    ],
    noStreak: [
      'Today is a new beginning. Start fresh! 🌅',
      'Every moment is a chance to reconnect with Allah 🤲',
      'Your spiritual journey starts with a single reflection 🌟',
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