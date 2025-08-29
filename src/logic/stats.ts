import { PrayerRecord } from '@/src/store/app-store';

export interface Stats {
  currentStreak: number;
  bestStreak: number;
  onTimeRate: number;
  perPrayerStats: Record<string, number>;
  weeklyData: {
    day: string;
    completed: number;
    total: number;
    percentage: number;
  }[];
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



  // Calculate current streak (consecutive days only)
  let currentStreak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0); // Start from today
  
  // Start from yesterday if today is not complete yet
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = prayerRecords.find(r => r.date === today);
  const todayCompleted = todayRecord ? todayRecord.prayers.filter(p => 
    p.status === 'on-time' || p.status === 'late'
  ).length : 0;
  
  // If today is not complete (less than 5 prayers), start checking from yesterday
  if (todayCompleted < 5) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Check consecutive days backwards from the starting date
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const record = prayerRecords.find(r => r.date === dateStr);
    
    if (!record) {
      // No record for this date, streak ends
      break;
    }
    
    const completedCount = record.prayers.filter(p => 
      p.status === 'on-time' || p.status === 'late'
    ).length;
    
    if (completedCount === 5) {
      currentStreak++;
      // Move to the previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Day was not complete, streak ends
      break;
    }
  }

  // Calculate best streak (consecutive days only)
  let bestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;
  
  // Sort by date (oldest first for best streak calculation)
  const chronologicalRecords = [...prayerRecords].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const record of chronologicalRecords) {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    
    const completedCount = record.prayers.filter(p => 
      p.status === 'on-time' || p.status === 'late'
    ).length;
    
    if (completedCount === 5) {
      // Check if this is consecutive to the last date
      if (lastDate === null) {
        // First completed day
        tempStreak = 1;
      } else {
        const expectedDate = new Date(lastDate);
        expectedDate.setDate(expectedDate.getDate() + 1);
        
        if (recordDate.getTime() === expectedDate.getTime()) {
          // Consecutive day
          tempStreak++;
        } else {
          // Not consecutive, start new streak
          tempStreak = 1;
        }
      }
      
      bestStreak = Math.max(bestStreak, tempStreak);
      lastDate = recordDate;
    } else {
      tempStreak = 0;
      lastDate = null;
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
  const currentDate = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentDate);
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