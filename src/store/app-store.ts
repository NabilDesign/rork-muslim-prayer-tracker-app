import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { notificationManager } from '@/src/logic/notifications';

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

export type PrayerStatus = 'prayed' | 'late' | 'missed' | null;

export interface PrayerData {
  status: PrayerStatus;
  comment: string;
}

export interface DayPrayerData {
  [prayerId: string]: PrayerData;
}

interface AppStore {
  // State
  reflections: Reflection[];
  badges: Badge[];
  settings: Settings;
  prayerData: { [date: string]: DayPrayerData };
  
  // Actions
  addReflection: (reflection: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReflection: (id: string, updates: Partial<Reflection>) => void;
  deleteReflection: (id: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  clearAllData: () => void;
  
  // Prayer Actions
  updatePrayerStatus: (prayerId: string, status: PrayerStatus) => void;
  addPrayerComment: (prayerId: string, comment: string) => void;
  getTodaysPrayers: () => DayPrayerData;
  getPrayerDataForDate: (date: string) => DayPrayerData;
  
  // Computed values
  getBadges: () => Badge[];
}

const STORAGE_KEYS = {
  REFLECTIONS: 'reflections',
  BADGES: 'badges',
  SETTINGS: 'settings',
  PRAYER_DATA: 'prayerData',
};

const defaultSettings: Settings = {
  notificationsEnabled: true,
  reminderMinutes: 720, // 2 times a day
  calculationMethod: 'ISNA',
  location: null,
};

export const useAppStore = create<AppStore>((set, get) => ({
  reflections: [],
  badges: [],
  settings: defaultSettings,
  prayerData: {},

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
      reflections: [],
      badges: [],
      settings: defaultSettings,
      prayerData: {},
    });
    
    Object.values(STORAGE_KEYS).forEach(key => {
      AsyncStorage.removeItem(key);
    });
    
    // Cancel all notifications
    notificationManager.cancelAllReminders();
  },

  getBadges: () => {
    return get().badges;
  },

  updatePrayerStatus: (prayerId, status) => {
    const today = new Date().toISOString().split('T')[0];
    const currentData = get().prayerData;
    const todayData = currentData[today] || {};
    
    const updatedTodayData = {
      ...todayData,
      [prayerId]: {
        ...todayData[prayerId],
        status,
        comment: todayData[prayerId]?.comment || '',
      },
    };
    
    const updatedPrayerData = {
      ...currentData,
      [today]: updatedTodayData,
    };
    
    set({ prayerData: updatedPrayerData });
    AsyncStorage.setItem(STORAGE_KEYS.PRAYER_DATA, JSON.stringify(updatedPrayerData));
  },

  addPrayerComment: (prayerId, comment) => {
    const today = new Date().toISOString().split('T')[0];
    const currentData = get().prayerData;
    const todayData = currentData[today] || {};
    
    const updatedTodayData = {
      ...todayData,
      [prayerId]: {
        ...todayData[prayerId],
        status: todayData[prayerId]?.status || null,
        comment,
      },
    };
    
    const updatedPrayerData = {
      ...currentData,
      [today]: updatedTodayData,
    };
    
    set({ prayerData: updatedPrayerData });
    AsyncStorage.setItem(STORAGE_KEYS.PRAYER_DATA, JSON.stringify(updatedPrayerData));
  },

  getTodaysPrayers: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().prayerData[today] || {};
  },

  getPrayerDataForDate: (date) => {
    return get().prayerData[date] || {};
  },
}));

// Initialize store from AsyncStorage
const initializeStore = async () => {
  try {
    const [reflections, badges, settings, prayerData] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.REFLECTIONS),
      AsyncStorage.getItem(STORAGE_KEYS.BADGES),
      AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      AsyncStorage.getItem(STORAGE_KEYS.PRAYER_DATA),
    ]);

    const parsedSettings = settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    
    useAppStore.setState({
      reflections: reflections ? JSON.parse(reflections) : [],
      badges: badges ? JSON.parse(badges) : [],
      settings: parsedSettings,
      prayerData: prayerData ? JSON.parse(prayerData) : {},
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