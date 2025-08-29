import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DhikrItem {
  id: string;
  text: string;
  transliteration: string;
  translation: string;
  count: number;
  category: string;
}

export interface DhikrRoutine {
  id: string;
  name: string;
  dhikrList: DhikrItem[];
  createdAt: string;
  completedCount: number;
  totalSessions: number;
}

export interface DhikrSession {
  id: string;
  routineId: string;
  date: string;
  completedDhikr: string[];
  totalCount: number;
  duration: number;
}

interface DhikrStore {
  // State
  routines: DhikrRoutine[];
  sessions: DhikrSession[];
  activeRoutine: DhikrRoutine | null;
  currentDhikrIndex: number;
  currentCount: number;
  isActive: boolean;
  startTime: number | null;
  
  // Actions
  createRoutine: (routine: { name: string; dhikrList: DhikrItem[] }) => void;
  deleteRoutine: (routineId: string) => void;
  updateRoutine: (routineId: string, updates: Partial<DhikrRoutine>) => void;
  startRoutine: (routineId: string) => void;
  pauseRoutine: () => void;
  resetRoutine: () => void;
  incrementCount: () => void;
  nextDhikr: () => void;
  completeSession: () => void;
  
  // Computed values
  getTotalSessions: () => number;
  getStreakDays: () => number;
  getTodaysSessions: () => DhikrSession[];
}

const STORAGE_KEYS = {
  DHIKR_ROUTINES: 'dhikr_routines',
  DHIKR_SESSIONS: 'dhikr_sessions',
};

export const useDhikrStore = create<DhikrStore>((set, get) => ({
  routines: [],
  sessions: [],
  activeRoutine: null,
  currentDhikrIndex: 0,
  currentCount: 0,
  isActive: false,
  startTime: null,

  createRoutine: (routineData) => {
    const newRoutine: DhikrRoutine = {
      id: Date.now().toString(),
      name: routineData.name,
      dhikrList: routineData.dhikrList,
      createdAt: new Date().toISOString(),
      completedCount: 0,
      totalSessions: 0,
    };

    const updatedRoutines = [...get().routines, newRoutine];
    set({ routines: updatedRoutines });
    AsyncStorage.setItem(STORAGE_KEYS.DHIKR_ROUTINES, JSON.stringify(updatedRoutines));
  },

  deleteRoutine: (routineId) => {
    const updatedRoutines = get().routines.filter(routine => routine.id !== routineId);
    set({ 
      routines: updatedRoutines,
      activeRoutine: get().activeRoutine?.id === routineId ? null : get().activeRoutine,
    });
    AsyncStorage.setItem(STORAGE_KEYS.DHIKR_ROUTINES, JSON.stringify(updatedRoutines));
  },

  updateRoutine: (routineId, updates) => {
    const updatedRoutines = get().routines.map(routine =>
      routine.id === routineId ? { ...routine, ...updates } : routine
    );
    set({ routines: updatedRoutines });
    AsyncStorage.setItem(STORAGE_KEYS.DHIKR_ROUTINES, JSON.stringify(updatedRoutines));
  },

  startRoutine: (routineId) => {
    const routine = get().routines.find(r => r.id === routineId);
    if (routine) {
      set({
        activeRoutine: routine,
        currentDhikrIndex: 0,
        currentCount: 0,
        isActive: true,
        startTime: Date.now(),
      });
    }
  },

  pauseRoutine: () => {
    set({ isActive: false });
  },

  resetRoutine: () => {
    set({
      currentDhikrIndex: 0,
      currentCount: 0,
      isActive: false,
      startTime: null,
    });
  },

  incrementCount: () => {
    const { activeRoutine, currentDhikrIndex, currentCount } = get();
    if (!activeRoutine) return;

    const currentDhikr = activeRoutine.dhikrList[currentDhikrIndex];
    if (!currentDhikr) return;

    const newCount = currentCount + 1;

    if (newCount >= currentDhikr.count) {
      // Move to next dhikr
      if (currentDhikrIndex < activeRoutine.dhikrList.length - 1) {
        set({
          currentDhikrIndex: currentDhikrIndex + 1,
          currentCount: 0,
        });
      } else {
        // Complete the routine
        get().completeSession();
      }
    } else {
      set({ currentCount: newCount });
    }
  },

  nextDhikr: () => {
    const { activeRoutine, currentDhikrIndex } = get();
    if (!activeRoutine) return;

    if (currentDhikrIndex < activeRoutine.dhikrList.length - 1) {
      set({
        currentDhikrIndex: currentDhikrIndex + 1,
        currentCount: 0,
      });
    } else {
      get().completeSession();
    }
  },

  completeSession: () => {
    const { activeRoutine, startTime, sessions } = get();
    if (!activeRoutine || !startTime) return;

    const newSession: DhikrSession = {
      id: Date.now().toString(),
      routineId: activeRoutine.id,
      date: new Date().toISOString().split('T')[0],
      completedDhikr: activeRoutine.dhikrList.map(d => d.id),
      totalCount: activeRoutine.dhikrList.reduce((sum, d) => sum + d.count, 0),
      duration: Date.now() - startTime,
    };

    const updatedSessions = [...sessions, newSession];
    const updatedRoutines = get().routines.map(routine =>
      routine.id === activeRoutine.id
        ? { 
            ...routine, 
            completedCount: routine.completedCount + 1,
            totalSessions: routine.totalSessions + 1,
          }
        : routine
    );

    set({
      sessions: updatedSessions,
      routines: updatedRoutines,
      activeRoutine: null,
      currentDhikrIndex: 0,
      currentCount: 0,
      isActive: false,
      startTime: null,
    });

    AsyncStorage.setItem(STORAGE_KEYS.DHIKR_SESSIONS, JSON.stringify(updatedSessions));
    AsyncStorage.setItem(STORAGE_KEYS.DHIKR_ROUTINES, JSON.stringify(updatedRoutines));
  },

  getTotalSessions: () => {
    return get().sessions.length;
  },

  getStreakDays: () => {
    const sessions = get().sessions;
    if (sessions.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const sortedDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const date of sortedDates) {
      const sessionDate = currentDate.toISOString().split('T')[0];
      if (date === sessionDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  },

  getTodaysSessions: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().sessions.filter(session => session.date === today);
  },
}));

// Initialize store from AsyncStorage
const initializeDhikrStore = async () => {
  try {
    const [routines, sessions] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.DHIKR_ROUTINES),
      AsyncStorage.getItem(STORAGE_KEYS.DHIKR_SESSIONS),
    ]);

    useDhikrStore.setState({
      routines: routines ? JSON.parse(routines) : [],
      sessions: sessions ? JSON.parse(sessions) : [],
    });
  } catch (error) {
    console.error('Error initializing dhikr store:', error);
  }
};

// Initialize on app start
initializeDhikrStore();