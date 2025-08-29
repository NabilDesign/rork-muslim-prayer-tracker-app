import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { calculateStats } from '@/src/logic/stats';
import { getBadgesForUser } from '@/src/logic/motivation';
import { notificationManager } from '@/src/logic/notifications';

export interface Prayer {
  name: string;
  status: 'pending' | 'on-time' | 'late' | 'missed';
  note?: string;
  completedAt?: string;
}

export interface PrayerRecord {
  date: string;
  prayers: Prayer[];
}

export interface Reflection {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  color: string;
}

export interface Settings {
  notificationsEnabled: boolean;
  reminderMinutes: number;
  calculationMethod: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

interface PrayerStore {
  // State
  prayerRecords: PrayerRecord[];
  todaysPrayers: Prayer[];
  reflections: Reflection[];
  badges: Badge[];
  settings: Settings;
  
  // Actions
  initializeTodaysPrayers: () => Promise<void>;
  markPrayer: (prayerName: string, status: 'on-time' | 'late' | 'missed') => void;
  markPrayerForDate: (date: string, prayerName: string, status: 'on-time' | 'late' | 'missed') => void;
  addPrayerNote: (prayerName: string, note: string) => void;
  addPrayerNoteForDate: (date: string, prayerName: string, note: string) => void;
  addReflection: (reflection: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReflection: (id: string, updates: Partial<Reflection>) => void;
  deleteReflection: (id: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  clearAllData: () => void;
  
  // Computed values
  getStreakDays: () => number;
  getBestStreak: () => number;
  getOnTimeRate: () => number;
  getPerPrayerStats: () => Record<string, number>;
  getWeeklyData: () => any[];
  getBadges: () => Badge[];
}

const STORAGE_KEYS = {
  PRAYER_RECORDS: 'prayer_records',
  REFLECTIONS: 'reflections',
  BADGES: 'badges',
  SETTINGS: 'settings',
};

const defaultSettings: Settings = {
  notificationsEnabled: true,
  reminderMinutes: 720, // 2 times a day
  calculationMethod: 'ISNA',
  location: null,
};

export const usePrayerStore = create<PrayerStore>((set, get) => ({
  prayerRecords: [],
  todaysPrayers: [],
  reflections: [],
  badges: [],
  settings: defaultSettings,

  initializeTodaysPrayers: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { prayerRecords } = get();
      
      // Check if we already have today's prayers
      const existingRecord = prayerRecords.find(record => record.date === today);
      
      if (existingRecord) {
        set({ todaysPrayers: existingRecord.prayers });
        return;
      }

      // Generate new prayers for today
      const newPrayers: Prayer[] = [
        { name: 'Fajr', status: 'pending' },
        { name: 'Dhuhr', status: 'pending' },
        { name: 'Asr', status: 'pending' },
        { name: 'Maghrib', status: 'pending' },
        { name: 'Isha', status: 'pending' },
      ];

      const newRecord: PrayerRecord = {
        date: today,
        prayers: newPrayers,
      };

      const updatedRecords = [...prayerRecords, newRecord];
      
      set({ 
        prayerRecords: updatedRecords,
        todaysPrayers: newPrayers 
      });

      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_RECORDS, JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error initializing prayers:', error);
    }
  },

  markPrayer: (prayerName: string, status: 'on-time' | 'late' | 'missed') => {
    const { prayerRecords, todaysPrayers } = get();
    const today = new Date().toISOString().split('T')[0];
    
    const updatedTodaysPrayers = todaysPrayers.map(prayer =>
      prayer.name === prayerName
        ? { 
            ...prayer, 
            status, 
            completedAt: new Date().toISOString() 
          }
        : prayer
    );

    const updatedRecords = prayerRecords.map(record =>
      record.date === today
        ? { ...record, prayers: updatedTodaysPrayers }
        : record
    );

    set({ 
      todaysPrayers: updatedTodaysPrayers,
      prayerRecords: updatedRecords 
    });

    // Save to storage
    AsyncStorage.setItem(STORAGE_KEYS.PRAYER_RECORDS, JSON.stringify(updatedRecords));
    
    // Check for new badges
    const stats = calculateStats(updatedRecords);
    const newBadges = getBadgesForUser(stats, get().badges);
    if (newBadges.length > 0) {
      const allBadges = [...get().badges, ...newBadges];
      set({ badges: allBadges });
      AsyncStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(allBadges));
    }
  },

  addPrayerNote: (prayerName: string, note: string) => {
    const { prayerRecords, todaysPrayers } = get();
    const today = new Date().toISOString().split('T')[0];
    
    const updatedTodaysPrayers = todaysPrayers.map(prayer =>
      prayer.name === prayerName ? { ...prayer, note } : prayer
    );

    const updatedRecords = prayerRecords.map(record =>
      record.date === today
        ? { ...record, prayers: updatedTodaysPrayers }
        : record
    );

    set({ 
      todaysPrayers: updatedTodaysPrayers,
      prayerRecords: updatedRecords 
    });

    AsyncStorage.setItem(STORAGE_KEYS.PRAYER_RECORDS, JSON.stringify(updatedRecords));
  },

  addPrayerNoteForDate: (date: string, prayerName: string, note: string) => {
    const { prayerRecords, todaysPrayers } = get();
    const today = new Date().toISOString().split('T')[0];
    
    let updatedRecords = [...prayerRecords];
    let existingRecord = updatedRecords.find(record => record.date === date);
    
    if (!existingRecord) {
      // Create a new record for this date
      existingRecord = {
        date,
        prayers: [
          { name: 'Fajr', status: 'pending' },
          { name: 'Dhuhr', status: 'pending' },
          { name: 'Asr', status: 'pending' },
          { name: 'Maghrib', status: 'pending' },
          { name: 'Isha', status: 'pending' },
        ],
      };
      updatedRecords.push(existingRecord);
    }
    
    updatedRecords = updatedRecords.map(record => {
      if (record.date === date) {
        const updatedPrayers = record.prayers.map(prayer =>
          prayer.name === prayerName ? { ...prayer, note } : prayer
        );
        return { ...record, prayers: updatedPrayers };
      }
      return record;
    });

    // If updating today's prayers, also update the todaysPrayers state
    let updatedTodaysPrayers = todaysPrayers;
    if (date === today) {
      updatedTodaysPrayers = todaysPrayers.map(prayer =>
        prayer.name === prayerName ? { ...prayer, note } : prayer
      );
    }

    set({ 
      prayerRecords: updatedRecords,
      todaysPrayers: updatedTodaysPrayers
    });

    AsyncStorage.setItem(STORAGE_KEYS.PRAYER_RECORDS, JSON.stringify(updatedRecords));
  },

  markPrayerForDate: (date: string, prayerName: string, status: 'on-time' | 'late' | 'missed') => {
    const { prayerRecords, todaysPrayers } = get();
    const today = new Date().toISOString().split('T')[0];
    
    let updatedRecords = [...prayerRecords];
    let existingRecord = updatedRecords.find(record => record.date === date);
    
    if (!existingRecord) {
      // Create a new record for this date
      existingRecord = {
        date,
        prayers: [
          { name: 'Fajr', status: 'pending' },
          { name: 'Dhuhr', status: 'pending' },
          { name: 'Asr', status: 'pending' },
          { name: 'Maghrib', status: 'pending' },
          { name: 'Isha', status: 'pending' },
        ],
      };
      updatedRecords.push(existingRecord);
    }
    
    updatedRecords = updatedRecords.map(record => {
      if (record.date === date) {
        const updatedPrayers = record.prayers.map(prayer =>
          prayer.name === prayerName
            ? { 
                ...prayer, 
                status, 
                completedAt: new Date().toISOString() 
              }
            : prayer
        );
        return { ...record, prayers: updatedPrayers };
      }
      return record;
    });

    // If updating today's prayers, also update the todaysPrayers state
    let updatedTodaysPrayers = todaysPrayers;
    if (date === today) {
      updatedTodaysPrayers = todaysPrayers.map(prayer =>
        prayer.name === prayerName
          ? { 
              ...prayer, 
              status, 
              completedAt: new Date().toISOString() 
            }
          : prayer
      );
    }

    set({ 
      prayerRecords: updatedRecords,
      todaysPrayers: updatedTodaysPrayers
    });

    // Save to storage
    AsyncStorage.setItem(STORAGE_KEYS.PRAYER_RECORDS, JSON.stringify(updatedRecords));
    
    // Check for new badges
    const stats = calculateStats(updatedRecords);
    const newBadges = getBadgesForUser(stats, get().badges);
    if (newBadges.length > 0) {
      const allBadges = [...get().badges, ...newBadges];
      set({ badges: allBadges });
      AsyncStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(allBadges));
    }
  },

  addReflection: (reflection) => {
    const newReflection: Reflection = {
      ...reflection,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedReflections = [newReflection, ...get().reflections];
    set({ reflections: updatedReflections });
    AsyncStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(updatedReflections));
  },

  updateReflection: (id, updates) => {
    const updatedReflections = get().reflections.map(reflection =>
      reflection.id === id
        ? { ...reflection, ...updates, updatedAt: new Date().toISOString() }
        : reflection
    );
    set({ reflections: updatedReflections });
    AsyncStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(updatedReflections));
  },

  deleteReflection: (id) => {
    const updatedReflections = get().reflections.filter(reflection => reflection.id !== id);
    set({ reflections: updatedReflections });
    AsyncStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(updatedReflections));
  },

  updateSettings: (updates) => {
    const updatedSettings = { ...get().settings, ...updates };
    set({ settings: updatedSettings });
    AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    
    // Update notifications if settings changed
    if (updates.notificationsEnabled !== undefined || updates.reminderMinutes !== undefined) {
      notificationManager.scheduleReminders({
        enabled: updatedSettings.notificationsEnabled,
        frequency: updatedSettings.reminderMinutes,
      });
    }
  },

  clearAllData: () => {
    set({
      prayerRecords: [],
      todaysPrayers: [],
      reflections: [],
      badges: [],
      settings: defaultSettings,
    });
    
    Object.values(STORAGE_KEYS).forEach(key => {
      AsyncStorage.removeItem(key);
    });
    
    // Cancel all notifications
    notificationManager.cancelAllReminders();
  },

  getStreakDays: () => {
    const { prayerRecords } = get();
    return calculateStats(prayerRecords).currentStreak;
  },

  getBestStreak: () => {
    const { prayerRecords } = get();
    return calculateStats(prayerRecords).bestStreak;
  },

  getOnTimeRate: () => {
    const { prayerRecords } = get();
    return calculateStats(prayerRecords).onTimeRate;
  },

  getPerPrayerStats: () => {
    const { prayerRecords } = get();
    return calculateStats(prayerRecords).perPrayerStats;
  },

  getWeeklyData: () => {
    const { prayerRecords } = get();
    return calculateStats(prayerRecords).weeklyData;
  },

  getBadges: () => {
    return get().badges;
  },
}));

// Initialize store from AsyncStorage
const initializeStore = async () => {
  try {
    const [records, reflections, badges, settings] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.PRAYER_RECORDS),
      AsyncStorage.getItem(STORAGE_KEYS.REFLECTIONS),
      AsyncStorage.getItem(STORAGE_KEYS.BADGES),
      AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
    ]);

    const parsedSettings = settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    
    usePrayerStore.setState({
      prayerRecords: records ? JSON.parse(records) : [],
      reflections: reflections ? JSON.parse(reflections) : [],
      badges: badges ? JSON.parse(badges) : [],
      settings: parsedSettings,
    });
    
    // Initialize notifications with current settings
    await notificationManager.scheduleReminders({
      enabled: parsedSettings.notificationsEnabled,
      frequency: parsedSettings.reminderMinutes,
    });
  } catch (error) {
    console.error('Error initializing store:', error);
  }
};

// Initialize on app start
initializeStore();