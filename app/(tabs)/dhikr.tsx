import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  Play,
  Plus,
  Trash2,
  X,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useDhikrStore } from '@/src/store/dhikr-store';
import { colors } from '@/src/theme/tokens';
import dhikrData from '@/src/data/dhikr.json';

// ✅ Helper: materialiseer routine input naar dhikrList
const materializeRoutine = (preset: { id: string; name: string; items: { itemId: string; target: number }[] }) =>
  preset.items.map((it) => {
    const d = dhikrData.find((x) => x.id === it.itemId)!;
    return { ...d, count: it.target };
  });

// ✅ Voorbeeld quick start
const presetRoutines = [
  {
    id: 'post-salah',
    name: 'Post-Salah Tasbih',
    items: [
      { itemId: 'subhanallah', target: 33 },
      { itemId: 'alhamdulillah', target: 33 },
      { itemId: 'allahu-akbar', target: 34 },
    ],
  },
];

export default function DhikrScreen() {
  const {
    routines,
    activeRoutine,
    currentDhikrIndex,
    currentCount,
    isActive,
    createRoutine,
    deleteRoutine,
    startRoutine,
    resetRoutine,
    incrementCount,
    nextDhikr,
  } = useDhikrStore();

  const [showCounter, setShowCounter] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [ephemeralRoutineId, setEphemeralRoutineId] = useState<string | null>(null);

  const currentDhikr = activeRoutine?.dhikrList[currentDhikrIndex];
  const currentTarget = currentDhikr?.count ?? 0;
  const isLastItem =
    !!activeRoutine && currentDhikrIndex === activeRoutine.dhikrList.length - 1;
  const progress = currentTarget
    ? Math.min(100, (currentCount / currentTarget) * 100)
    : 0;

  // ✅ Routine starten (quick start → tijdelijk)
  const startPreset = (preset: any) => {
    const dhikrList = materializeRoutine(preset);
    const id = createRoutine({
      name: preset.name,
      dhikrList,
      meta: { preset: true },
    } as any);
    startRoutine(id);
    setEphemeralRoutineId(id);
    setShowCounter(true);
  };

  // ✅ Counter tap
  const onNextOrFinish = () => {
    if (!activeRoutine || !currentDhikr) return;
    const willReach = currentCount + 1 >= currentTarget;

    if (isLastItem && willReach) {
      Haptics.notificationAsync?.(
        Haptics.NotificationFeedbackType.Success
      );
      setIsDone(true);
      return;
    }
    if (willReach) {
      nextDhikr();
    } else {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
      incrementCount();
    }
  };

  // ✅ Kleine “✓”-knop → finish als laatste
  const onSkipOrFinish = () => {
    if (!activeRoutine) return;
    if (isLastItem) {
      Haptics.notificationAsync?.(
        Haptics.NotificationFeedbackType.Success
      );
      setIsDone(true);
      return;
    }
    nextDhikr();
  };

  // ✅ Sluit modal en opruimen
  const closeCounter = () => {
    setShowCounter(false);
    setIsDone(false);
    if (ephemeralRoutineId) {
      deleteRoutine(ephemeralRoutineId);
      setEphemeralRoutineId(null);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Dhikr' }} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dhikr & Remembrance</Text>
          <Text style={styles.headerSubtitle}>
            Strengthen your connection with Allah
          </Text>
        </View>

        {/* ✅ Quick Start */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {presetRoutines.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.routineCard}
                onPress={() => startPreset(r)}
              >
                <Play color="#fff" size={20} />
                <Text style={styles.routineCardText}>{r.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ✅ Custom Routines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Custom Routines</Text>
          {routines
            .filter((r: any) => !r?.meta?.preset)
            .map((routine: any) => (
              <View key={routine.id} style={styles.customRoutine}>
                <Text style={styles.customRoutineText}>{routine.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    startRoutine(routine.id);
                    setShowCounter(true);
                  }}
                >
                  <Play color={colors.primary[600]} size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteRoutine(routine.id)}
                >
                  <Trash2 color="red" size={20} />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* ✅ Counter Modal */}
      <Modal
        visible={showCounter}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeCounter}
      >
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={closeCounter}
          >
            <X color="#fff" size={28} />
          </TouchableOpacity>

          {isDone ? (
            <View style={styles.doneWrap}>
              <View style={styles.doneBadge}>
                <Check color="#fff" size={36} />
              </View>
              <Text style={styles.doneTitle}>Routine complete!</Text>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={closeCounter}
              >
                <Text style={styles.doneBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: 'transparent' }]}
                onPress={() => {
                  setIsDone(false);
                  resetRoutine();
                }}
              >
                <Text style={[styles.doneBtnText, { color: '#fff' }]}>
                  Restart
                </Text>
              </TouchableOpacity>
            </View>
          ) : activeRoutine && currentDhikr ? (
            <View style={styles.counterContent}>
              <Text style={styles.counterRoutineName}>
                {activeRoutine.name}
              </Text>

              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentCount} / {currentTarget}
              </Text>

              <Text style={styles.counterArabic}>{currentDhikr.text}</Text>
              <Text style={styles.counterTranslit}>
                {currentDhikr.transliteration}
              </Text>
              <Text style={styles.counterTranslation}>
                {currentDhikr.translation}
              </Text>

              <TouchableOpacity
                style={styles.counterButton}
                onPress={onNextOrFinish}
              >
                <Text style={styles.counterButtonText}>{currentCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipBtn}
                onPress={onSkipOrFinish}
              >
                <Check color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 15, color: '#6B7280' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  routineCard: {
    backgroundColor: colors.primary[600],
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  routineCardText: { color: '#fff', fontWeight: '600', marginTop: 8 },
  customRoutine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    alignItems: 'center',
  },
  customRoutineText: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  counterContainer: { flex: 1, backgroundColor: colors.primary[600], padding: 20 },
  closeBtn: { position: 'absolute', top: 50, right: 20 },
  counterContent: { marginTop: 100, alignItems: 'center' },
  counterRoutineName: { color: '#fff', fontSize: 20, marginBottom: 20 },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: { height: '100%', backgroundColor: '#fff' },
  progressText: { color: '#fff', marginBottom: 20 },
  counterArabic: { fontSize: 28, color: '#fff', marginBottom: 12 },
  counterTranslit: { fontSize: 18, fontStyle: 'italic', color: '#fff' },
  counterTranslation: { fontSize: 16, color: '#fff', marginBottom: 24 },
  counterButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  counterButtonText: { fontSize: 42, fontWeight: '800', color: colors.primary[600] },
  skipBtn: {
    marginTop: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  doneBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  doneTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 20 },
  doneBtn: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    marginTop: 10,
  },
  doneBtnText: { fontWeight: '700', fontSize: 16, color: colors.primary[600] },
});
