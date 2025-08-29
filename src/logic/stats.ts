import { Reflection } from '@/src/store/app-store';

export interface Stats {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  weeklyData: {
    day: string;
    completed: number;
    total: number;
    percentage: number;
  }[];
  totalReflections: number;
  thisWeekReflections: number;
}

const getPreviousDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

const isConsecutiveDate = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

export const calculateStats = (reflections: Reflection[]): Stats => {
  if (reflections.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      completionRate: 0,
      weeklyData: [],
      totalReflections: 0,
      thisWeekReflections: 0,
    };
  }

  // Group reflections by date
  const reflectionsByDate = reflections.reduce((acc, reflection) => {
    const date = reflection.createdAt.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate current streak (consecutive days with reflections)
  const today = new Date().toISOString().split('T')[0];
  let currentStreak = 0;
  
  // Count consecutive days with reflections backwards from today
  let checkDate = today;
  while (reflectionsByDate[checkDate]) {
    currentStreak++;
    checkDate = getPreviousDate(checkDate);
  }

  // Calculate best streak
  let bestStreak = 0;
  let tempStreak = 0;
  
  // Get all dates with reflections, sorted chronologically
  const datesWithReflections = Object.keys(reflectionsByDate).sort();
  
  let previousDate: string | null = null;
  
  datesWithReflections.forEach(date => {
    // Check if this date is consecutive to the previous date
    if (previousDate === null || isConsecutiveDate(previousDate, date)) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
    previousDate = date;
  });
  
  // Ensure current streak is considered for best streak
  bestStreak = Math.max(bestStreak, currentStreak);

  // Calculate completion rate (days with reflections vs total days since first reflection)
  const totalReflections = reflections.length;
  const daysWithReflections = Object.keys(reflectionsByDate).length;
  const firstReflectionDate = reflections.length > 0 ? 
    new Date(Math.min(...reflections.map(r => new Date(r.createdAt).getTime()))) : new Date();
  const totalDaysSinceFirst = Math.ceil((new Date().getTime() - firstReflectionDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const completionRate = totalDaysSinceFirst > 0 ? daysWithReflections / totalDaysSinceFirst : 0;

  // Calculate weekly data (last 7 days)
  const weeklyData = [];
  let thisWeekReflections = 0;
  const currentDate = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const completed = reflectionsByDate[dateStr] || 0;
    thisWeekReflections += completed;
    
    weeklyData.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      completed,
      total: 1, // Target of 1 reflection per day
      percentage: completed > 0 ? 100 : 0,
    });
  }

  return {
    currentStreak,
    bestStreak,
    completionRate,
    weeklyData,
    totalReflections,
    thisWeekReflections,
  };
};