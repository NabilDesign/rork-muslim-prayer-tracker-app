import { PrayerRecord } from '@/src/store/app-store';

export interface Stats {
  currentStreak: number;
  bestStreak: number;
  onTimeRate: number;
  perPrayerStats: Record<string, number>;
  weeklyData: Array<{
    day: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
  totalPrayers: number;
  completedPrayers: number;
}

export const calculateStats = (prayerRecords: PrayerRecord[]): Stats => {
  if (prayerRecords.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      onTimeRate: 0,
      perPrayerStats: {
        Fajr: 0,
        Dhuhr: 0,
        Asr: 0,
        Maghrib: 0,
        Isha: 0,
      },
      weeklyData: [],
      totalPrayers: 0,
      completedPrayers: 0,
    };
  }

  // Sort records by date (newest first for streak calculation)
  const sortedRecords = [...prayerRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate current streak
  let currentStreak = 0;
  for (const record of sortedRecords) {
    const completedCount = record.prayers.filter(p => 
      p.status === 'on-time' || p.status === 'late'
    ).length;
    
    if (completedCount === 5) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate best streak
  let bestStreak = 0;
  let tempStreak = 0;
  
  // Sort by date (oldest first for best streak calculation)
  const chronologicalRecords = [...prayerRecords].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const record of chronologicalRecords) {
    const completedCount = record.prayers.filter(p => 
      p.status === 'on-time' || p.status === 'late'
    ).length;
    
    if (completedCount === 5) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Calculate overall stats
  let totalPrayers = 0;
  let completedPrayers = 0;
  let onTimePrayers = 0;
  const prayerCounts: Record<string, { total: number; onTime: number }> = {
    Fajr: { total: 0, onTime: 0 },
    Dhuhr: { total: 0, onTime: 0 },
    Asr: { total: 0, onTime: 0 },
    Maghrib: { total: 0, onTime: 0 },
    Isha: { total: 0, onTime: 0 },
  };

  prayerRecords.forEach(record => {
    record.prayers.forEach(prayer => {
      totalPrayers++;
      prayerCounts[prayer.name].total++;
      
      if (prayer.status === 'on-time' || prayer.status === 'late') {
        completedPrayers++;
      }
      
      if (prayer.status === 'on-time') {
        onTimePrayers++;
        prayerCounts[prayer.name].onTime++;
      }
    });
  });

  const onTimeRate = totalPrayers > 0 ? onTimePrayers / totalPrayers : 0;

  // Calculate per-prayer stats
  const perPrayerStats: Record<string, number> = {};
  Object.entries(prayerCounts).forEach(([prayer, counts]) => {
    perPrayerStats[prayer] = counts.total > 0 ? counts.onTime / counts.total : 0;
  });

  // Calculate weekly data (last 7 days)
  const weeklyData = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const record = prayerRecords.find(r => r.date === dateStr);
    const completed = record ? record.prayers.filter(p => 
      p.status === 'on-time' || p.status === 'late'
    ).length : 0;
    
    weeklyData.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      completed,
      total: 5,
      percentage: (completed / 5) * 100,
    });
  }

  return {
    currentStreak,
    bestStreak,
    onTimeRate,
    perPrayerStats,
    weeklyData,
    totalPrayers,
    completedPrayers,
  };
};