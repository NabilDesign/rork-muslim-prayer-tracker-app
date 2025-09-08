// app/(tabs)/dhikr.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  FlatList,
  SectionList,
  Animated,
  Easing,
} from 'react-native';
import { Stack } from 'expo-router';
import { Play, Plus, Trash2, X, Check, Minus, RotateCcw, Pause } from 'lucide-react-native';
import { useDhikrStore } from '@/src/store/dhikr-store';

// Optioneel (Expo)
let Haptics: any = null;
try { Haptics = require('expo-haptics'); } catch {}

const colors = {
  bg: '#F7FAFC',
  surface: '#FFFFFF',
  border: '#E6EEF6',
  ink: { primary: '#0F172A', secondary: '#64748B' },
  primary: { 500: '#10B981', 600: '#059669' },
  status: { missed: '#EF4444' },
  gradient: { start: '#10B981', end: '#3B82F6' },
};
const typography = {
  headline: { fontSize: 26, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16 },
  small: { fontSize: 13 },
};

type DhikrItem = {
  id: string;
  text: string;
  transliteration: string;
  translation: string;
  count: number;
  category: string;
};
type RoutineInput = { name: string; items: Array<{ id: string; target: number }> };

const AVAILABLE_DHIKR: DhikrItem[] = [
  { id: 'subhanallah', text: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhan Allah', translation: 'Glory be to Allah', count: 33, category: 'Tasbih' },
  { id: 'alhamdulillah', text: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation: 'Praise be to Allah', count: 33, category: 'Tahmid' },
  { id: 'allahu-akbar', text: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', count: 34, category: 'Takbir' },
  { id: 'la-ilaha-illa-allah', text: 'لَا إِلَهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illa Allah', translation: 'There is no god but Allah', count: 100, category: 'Tahlil' },
  { id: 'astaghfirullah', text: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', count: 100, category: 'Istighfar' },
  { id: 'istighfar-long', text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ ...', transliteration: 'Astaghfirullah al-Azeem ...', translation: 'I seek forgiveness from Allah the Mighty ...', count: 10, category: 'Istighfar' },
  { id: 'salawat', text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allahumma salli ala Muhammad', translation: 'Send blessings upon Muhammad', count: 10, category: 'Salawat' },
  { id: 'hasbi-allah', text: 'حَسْبُنَا اللَّهُ...', transliteration: "Hasbuna Allahu...", translation: 'Allah is sufficient for us...', count: 7, category: 'Tawakkul' },
  { id: 'ayat-kursi-ending', text: 'وَلَا يَئُودُهُ حِفْظُهُمَا ...', transliteration: 'Ayat al-Kursi (ending)', translation: '...', count: 10, category: 'Protection' },
  { id: 'dua-protection', text: 'أَعُوذُ بِاللَّهِ...', transliteration: "A'udhu billahi...", translation: 'I seek refuge in Allah...', count: 3, category: 'Protection' },
  { id: 'morning-evening-dhikr', text: 'رَضِيتُ بِاللَّهِ...', transliteration: 'Radeetu billahi...', translation: 'I am pleased with Allah...', count: 1, category: 'Morning/Evening' },
  { id: 'rabbana-atina', text: 'رَبَّنَا آتِنَا...', transliteration: 'Rabbana atina...', translation: 'Our Lord, give us good...', count: 7, category: 'Dua' },
];

const CATEGORIES = ['All', ...Array.from(new Set(AVAILABLE_DHIKR.map(d => d.category)))];

const presetRoutines: RoutineInput[] = [
  { name: 'Post-Salah Tasbih', items: [{ id: 'subhanallah', target: 33 }, { id: 'alhamdulillah', target: 33 }, { id: 'allahu-akbar', target: 34 }] },
  { name: 'Morning Dhikr', items: [{ id: 'morning-evening-dhikr', target: 1 }, { id: 'astaghfirullah', target: 100 }, { id: 'la-ilaha-illa-allah', target: 100 }, { id: 'salawat', target: 10 }] },
  { name: 'Protection & Refuge', items: [{ id: 'dua-protection', target: 3 }, { id: 'ayat-kursi-ending', target: 10 }, { id: 'hasbi-allah', target: 7 }] },
  { name: 'Gratitude & Praise', items: [{ id: 'alhamdulillah', target: 100 }, { id: 'subhanallah', target: 100 }, { id: 'allahu-akbar', target: 100 }, { id: 'salawat', target: 3 }] },
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
    pauseRoutine,
    resetRoutine,
    incrementCount,
    nextDhikr,
  } = useDhikrStore();

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // quick start routine (tijdelijk, verbergen & opruimen)
  const [ephemeralRoutineId, setEphemeralRoutineId] = useState<string | null>(null);

  // create modal state
  const [routineName, setRoutineName] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string; target: number }>>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');

  // progress anim
  const routineProgressAnim = useRef(new Animated.Value(0)).current;
  const routineLength = activeRoutine?.dhikrList?.length ?? 0;
  const routineProgress = routineLength > 0 ? Math.min(currentDhikrIndex, routineLength - 1) / Math.max(1, routineLength) : 0;
  useEffect(() => {
    Animated.timing(routineProgressAnim, { toValue: routineProgress, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [routineProgress]);

  // current pointers
  const currentDhikr = activeRoutine?.dhikrList?.[currentDhikrIndex];
  const currentTarget = currentDhikr?.count ?? 0;
  const isLastItem = !!activeRoutine && currentDhikrIndex >= routineLength - 1;

  // detecteer automatisch "klaar" als index voorbij lengte zou gaan
  useEffect(() => {
    if (activeRoutine && currentDhikrIndex >= routineLength) {
      setIsDone(true);
    }
  }, [activeRoutine, currentDhikrIndex, routineLength]);

  // helpers
  const dhikrById = (id: string) => AVAILABLE_DHIKR.find(d => d.id === id);
  const materializeRoutine = (r: RoutineInput) =>
    r.items.map(it => {
      const base = dhikrById(it.id)!;
      return { ...base, count: it.target };
    });

  /** Create & start helper (FIX): zoek ID van net toegevoegde routine in store en start die */
  const createAndStart = (name: string, dhikrList: DhikrItem[]) => {
    const beforeIds = new Set(useDhikrStore.getState().routines.map((r: any) => r.id));
    // @ts-ignore - createRoutine neemt ten minste {name, dhikrList}
    createRoutine({ name, dhikrList });
    const afterState = useDhikrStore.getState();
    const newRoutine =
      afterState.routines.find((r: any) => !beforeIds.has(r.id)) ||
      afterState.routines.slice(-1)[0];
    if (newRoutine?.id) {
      startRoutine(newRoutine.id);
      return newRoutine.id as string;
    }
    return null;
  };

  // Quick Start (ephemeral)
  const startPreset = (preset: RoutineInput) => {
    const dhikrList = materializeRoutine(preset);
    const id = createAndStart(preset.name, dhikrList);
    setEphemeralRoutineId(id);
    setIsDone(false);
    setShowCounter(true);
  };

  // teller tap
  const onNextOrFinish = () => {
    if (!activeRoutine) return;
    const willReach = currentCount + 1 >= (currentTarget || 0);

    if ((isLastItem || routineLength === 0) && willReach) {
      if (Haptics?.notificationAsync) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsDone(true);
      return;
    }
    if (willReach) {
      nextDhikr();
    } else {
      if (Haptics?.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      incrementCount();
    }
  };

  // sluiten & ephemeral opruimen
  const closeCounter = () => {
    setShowCounter(false);
    setIsDone(false);
    if (ephemeralRoutineId) {
      deleteRoutine(ephemeralRoutineId);
      setEphemeralRoutineId(null);
    }
  };

  // Create modal filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AVAILABLE_DHIKR.filter(d => {
      if (category !== 'All' && d.category !== category) return false;
      if (!q) return true;
      return d.text.toLowerCase().includes(q) || d.transliteration.toLowerCase().includes(q) || d.translation.toLowerCase().includes(q);
    });
  }, [query, category]);

  const grouped = useMemo(() => {
    const by: Record<string, DhikrItem[]> = {};
    for (const d of filtered) (by[d.category] = by[d.category] || []).push(d);
    return Object.keys(by).sort().map(k => ({ title: k, data: by[k] }));
  }, [filtered]);

  const addItem = (id: string) => {
    if (selectedItems.some(it => it.id === id)) return;
    const base = dhikrById(id);
    setSelectedItems(prev => [...prev, { id, target: base?.count ?? 33 }]);
  };
  const removeItem = (id: string) => setSelectedItems(prev => prev.filter(it => it.id !== id));
  const setTarget = (id: string, n: number) => setSelectedItems(prev => prev.map(it => (it.id === id ? { ...it, target: Math.max(1, n) } : it)));

  const saveRoutine = () => {
    if (!routineName.trim()) return Alert.alert('Error', 'Please enter a routine name');
    if (selectedItems.length === 0) return Alert.alert('Error', 'Please add at least one dhikr to the routine');
    const dhikrList = materializeRoutine({ name: routineName.trim(), items: selectedItems });
    const id = createAndStart(routineName.trim(), dhikrList);
    setShowCreateModal(false);
    setRoutineName('');
    setSelectedItems([]);
    setEphemeralRoutineId(null); // dit is GEEN quick start
    setIsDone(false);
    setShowCounter(true);
  };

  // zichtbare routines (verberg quick-start ephemeral)
  const visibleRoutines = useMemo(
    () => routines.filter((r: any) => r.id !== ephemeralRoutineId),
    [routines, ephemeralRoutineId]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Dhikr' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dhikr & Remembrance</Text>
          <Text style={styles.headerSubtitle}>Strengthen your connection with Allah</Text>
        </View>

        <View style={styles.content}>
          {/* Quick Start */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Start</Text>
            <Text style={styles.sectionDescription}>Choose a preset routine to begin</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routinesScrollContainer} style={styles.routinesScroll}>
            {presetRoutines.map((p, idx) => (
              <TouchableOpacity key={idx} style={styles.routineCard} onPress={() => startPreset(p)} activeOpacity={0.85}>
                <View style={styles.routineIconContainer}><Play color={colors.surface} size={20} /></View>
                <Text style={styles.routineName}>{p.name}</Text>
                <Text style={styles.routineDescription}>{p.items.length} dhikr • {p.items.reduce((s, it) => s + it.target, 0)} total</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Custom routines */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Custom Routines</Text>
            <Text style={styles.sectionDescription}>Personalized dhikr collections</Text>
          </View>

          {visibleRoutines.length === 0 ? (
            <View style={styles.emptyList}><Text style={styles.emptyText}>No routines yet</Text></View>
          ) : (
            <View style={styles.customRoutinesList}>
              {visibleRoutines.map((r: any) => (
                <View key={r.id} style={styles.customRoutineCard}>
                  <TouchableOpacity style={styles.customRoutineMain} onPress={() => { startRoutine(r.id); setIsDone(false); setShowCounter(true); }} activeOpacity={0.85}>
                    <View style={styles.customRoutineInfo}>
                      <Text style={styles.customRoutineName}>{r.name}</Text>
                      <Text style={styles.customRoutineDescription}>
                        {r.dhikrList.length} dhikr • {r.dhikrList.reduce((s: number, d: DhikrItem) => s + d.count, 0)} total
                      </Text>
                    </View>
                    <View style={styles.customRoutineIcon}><Play color={colors.primary[600]} size={18} /></View>
                  </TouchableOpacity>

                  <View style={styles.customRoutineActions}>
                    <TouchableOpacity style={styles.routineActionButton} onPress={() => deleteRoutine(r.id)}>
                      <Trash2 color={colors.status.missed} size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.createRoutineButton} onPress={() => setShowCreateModal(true)}>
            <Plus color={colors.primary[600]} size={20} />
            <Text style={styles.createRoutineText}>Create Custom Routine</Text>
          </TouchableOpacity>

          {/* All Dhikr */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Dhikr</Text>
            <Text style={styles.sectionDescription}>Browse individual remembrances</Text>
          </View>

          <View style={styles.dhikrList}>
            {AVAILABLE_DHIKR.map((item, index) => (
              <View key={item.id} style={[styles.dhikrCard, index === AVAILABLE_DHIKR.length - 1 && styles.lastDhikrCard]}>
                <View style={styles.dhikrNumber}><Text style={styles.dhikrNumberText}>{index + 1}</Text></View>
                <View style={styles.dhikrContentContainer}>
                  <Text style={styles.arabicText}>{item.text}</Text>
                  <Text style={styles.translitText}>{item.transliteration}</Text>
                  <Text style={styles.translationText}>{item.translation}</Text>
                  {!!item.count && <Text style={styles.targetText}>Recommended: {item.count}x</Text>}
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      {/* Counter Modal */}
      <Modal visible={showCounter} animationType="slide" presentationStyle="fullScreen" onRequestClose={closeCounter}>
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterCloseButton} onPress={closeCounter}>
            <Text style={styles.counterCloseText}>✕</Text>
          </TouchableOpacity>

          {isDone ? (
            // DONE
            <View style={styles.doneWrap}>
              <View style={styles.doneBadge}><Check color="#fff" size={36} /></View>
              <Text style={styles.doneTitle}>Routine complete!</Text>
              <Text style={styles.doneSubtitle}>Masha’Allah — je hebt alles afgerond.</Text>
              <View style={styles.doneButtons}>
                <TouchableOpacity style={[styles.doneBtn, styles.donePrimary]} onPress={closeCounter}>
                  <Text style={styles.donePrimaryText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.doneBtn, styles.doneGhost]} onPress={() => { setIsDone(false); resetRoutine(); }}>
                  <Text style={styles.doneGhostText}>Restart</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : !activeRoutine || !currentDhikr ? (
            // STARTING / SAFETY FALLBACK (nooit meer leeg)
            <View style={styles.doneWrap}>
              <Text style={[styles.doneTitle, { marginBottom: 8 }]}>Preparing…</Text>
              <Text style={styles.doneSubtitle}>Starting your routine</Text>
            </View>
          ) : (
            // NORMAAL
            <View style={styles.counterContent}>
              <Text style={styles.counterRoutineName}>{activeRoutine.name}</Text>

              <View style={styles.counterControlsRow}>
                <TouchableOpacity style={[styles.smallCtrlBtn, { backgroundColor: '#ffffff22', borderColor: '#ffffff40' }]} onPress={() => { resetRoutine(); setIsDone(false); }}>
                  <RotateCcw color={colors.surface} size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallCtrlBtn, { backgroundColor: isActive ? '#F59E0B' : '#16A34A', borderColor: '#ffffff40' }]}
                  onPress={() => (isActive ? pauseRoutine() : startRoutine(activeRoutine.id))}
                >
                  {isActive ? <Pause color={colors.surface} size={18} /> : <Play color={colors.surface} size={18} />}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallCtrlBtn, { backgroundColor: '#ffffff22', borderColor: '#ffffff40' }]} onPress={() => nextDhikr()}>
                  <Check color={colors.surface} size={18} />
                </TouchableOpacity>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View style={[styles.progressFill, { width: routineProgressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
                </View>
                <Text style={styles.progressText}>
                  {Math.min(currentDhikrIndex + 1, routineLength)} / {routineLength} • {currentCount} / {currentTarget}
                </Text>
              </View>

              <View style={styles.counterDhikrContent}>
                <Text style={styles.counterArabic}>{currentDhikr.text}</Text>
                <Text style={styles.counterTranslit}>{currentDhikr.transliteration}</Text>
                <Text style={styles.counterTranslation}>{currentDhikr.translation}</Text>
              </View>

              <TouchableOpacity style={styles.counterButton} onPress={onNextOrFinish}>
                <Text style={styles.counterButtonText}>{currentCount}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Create Routine Modal (SectionList = parent) */}
      <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCreateModal(false)}>
        <SafeAreaView style={styles.createModalContainer}>
          <View style={styles.createModalHeader}>
            <Text style={styles.createModalTitle}>Create New Routine</Text>
            <TouchableOpacity style={styles.createModalClose} onPress={() => setShowCreateModal(false)}>
              <X color={colors.ink.secondary} size={24} />
            </TouchableOpacity>
          </View>

          <SectionList
            sections={grouped}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled
            contentContainerStyle={{ padding: 20, paddingBottom: 0 }}
            ListHeaderComponent={
              <View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.inputLabel}>Routine Name</Text>
                  <TextInput
                    style={styles.routineNameInput}
                    value={routineName}
                    onChangeText={setRoutineName}
                    placeholder="e.g., Evening Dhikr, Quick Tasbih"
                    placeholderTextColor={colors.ink.secondary + '80'}
                    maxLength={50}
                  />
                </View>

                <View style={{ marginBottom: 8 }}>
                  <View style={styles.searchWrap}>
                    <TextInput
                      style={styles.searchInput}
                      value={query}
                      onChangeText={setQuery}
                      placeholder="Search arabic / transliteration / translation"
                      placeholderTextColor={colors.ink.secondary + '80'}
                    />
                    {query.length > 0 && (
                      <Pressable onPress={() => setQuery('')} style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}>
                        <X size={16} color={colors.ink.secondary} />
                      </Pressable>
                    )}
                  </View>

                  <FlatList
                    data={CATEGORIES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(c) => c}
                    contentContainerStyle={{ paddingVertical: 6 }}
                    renderItem={({ item }) => {
                      const selected = category === item;
                      return (
                        <Pressable
                          onPress={() => setCategory(item)}
                          style={({ pressed }) => [
                            styles.chip,
                            { backgroundColor: selected ? '#DCFCE7' : '#F1F5F9', borderColor: colors.border, marginRight: 8 },
                            pressed && { opacity: 0.8 },
                          ]}
                        >
                          <Text style={{ color: selected ? colors.primary[600] : colors.ink.secondary, fontWeight: '700' }}>{item}</Text>
                        </Pressable>
                      );
                    }}
                  />
                </View>

                <View style={{ marginTop: 12, marginBottom: 8 }}>
                  <Text style={styles.inputLabel}>Selected Dhikr ({selectedItems.length})</Text>
                  {selectedItems.length > 0 ? (
                    <View style={{ gap: 12 }}>
                      {selectedItems.map((it) => {
                        const d = AVAILABLE_DHIKR.find(x => x.id === it.id);
                        if (!d) return null;
                        return (
                          <View key={it.id} style={styles.selectedItemCard}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.selectedItemArabic}>{d.text}</Text>
                              <Text style={styles.selectedItemTranslit}>{d.transliteration}</Text>
                            </View>
                            <View style={styles.selectedItemControls}>
                              <View style={styles.targetControls}>
                                <TouchableOpacity style={styles.targetButton} onPress={() => setTarget(it.id, it.target - 1)}>
                                  <Minus color={colors.ink.secondary} size={16} />
                                </TouchableOpacity>
                                <Text style={styles.targetValue}>{it.target}</Text>
                                <TouchableOpacity style={styles.targetButton} onPress={() => setTarget(it.id, it.target + 1)}>
                                  <Plus color={colors.ink.secondary} size={16} />
                                </TouchableOpacity>
                              </View>
                              <TouchableOpacity style={styles.removeItemButton} onPress={() => removeItem(it.id)}>
                                <Trash2 color={colors.status.missed} size={16} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.noSelectedItems}>No dhikr selected yet</Text>
                  )}
                </View>

                <Text style={[styles.inputLabel, { marginTop: 6 }]}>Add Dhikr</Text>
              </View>
            }
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeaderChip}><Text style={styles.sectionHeaderChipText}>{title}</Text></View>
            )}
            renderItem={({ item }) => {
              const isSel = selectedItems.some(x => x.id === item.id);
              return (
                <TouchableOpacity
                  style={[styles.availableDhikrCard, isSel && styles.availableDhikrCardSelected]}
                  onPress={() => (isSel ? removeItem(item.id) : addItem(item.id))}
                  disabled={isSel}
                >
                  <View style={styles.availableDhikrInfo}>
                    <Text style={styles.availableDhikrArabic}>{item.text}</Text>
                    <Text style={styles.availableDhikrTranslit}>{item.transliteration}</Text>
                    <Text style={styles.availableDhikrTranslation}>{item.translation}</Text>
                  </View>
                  <View style={[styles.availableDhikrCheck, isSel && styles.availableDhikrCheckSelected]}>
                    {isSel && <Check color={colors.surface} size={16} />}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />

          <View style={styles.createModalFooter}>
            <TouchableOpacity style={styles.saveRoutineButton} onPress={saveRoutine}>
              <Text style={styles.saveRoutineText}>Create Routine</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, alignItems: 'center' },
  headerTitle: { ...typography.headline, color: colors.ink.primary, textAlign: 'center', marginBottom: 4 },
  headerSubtitle: { ...typography.small, color: colors.ink.secondary, textAlign: 'center', fontSize: 15 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },

  sectionHeader: { marginBottom: 16, marginTop: 8 },
  sectionTitle: { ...typography.h2, color: colors.ink.primary, marginBottom: 4, fontSize: 22 },
  sectionDescription: { ...typography.small, color: colors.ink.secondary, fontSize: 15 },

  routinesScroll: { marginBottom: 32 },
  routinesScrollContainer: { paddingHorizontal: 0, gap: 16 },

  routineCard: {
    width: 180, backgroundColor: colors.primary[500], borderRadius: 24, padding: 24, alignItems: 'center',
    shadowColor: colors.primary[500], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  routineIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  routineName: { ...typography.h2, color: colors.surface, textAlign: 'center', marginBottom: 8, fontSize: 18 },
  routineDescription: { ...typography.small, color: colors.surface, textAlign: 'center', opacity: 0.9, fontSize: 13 },

  emptyList: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 16, alignItems: 'center' },
  emptyText: { color: colors.ink.secondary },

  customRoutinesList: { gap: 12, marginBottom: 24 },
  customRoutineCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  customRoutineMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  customRoutineInfo: { flex: 1 },
  customRoutineName: { ...typography.body, color: colors.ink.primary, fontWeight: '600', fontSize: 16, marginBottom: 4 },
  customRoutineDescription: { ...typography.small, color: colors.ink.secondary, fontSize: 13 },
  customRoutineIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary[500] + '15', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  customRoutineActions: { flexDirection: 'row', gap: 8 },
  routineActionButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  createRoutineButton: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.primary[500] + '30', borderStyle: 'dashed', marginBottom: 20,
  },
  createRoutineText: { ...typography.body, color: colors.primary[600], fontWeight: '600', marginLeft: 8, fontSize: 16 },

  dhikrList: { gap: 0 },
  dhikrCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: colors.border,
  },
  lastDhikrCard: { marginBottom: 0 },
  dhikrNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary[500] + '15', alignItems: 'center', justifyContent: 'center', marginRight: 16, marginTop: 4 },
  dhikrNumberText: { ...typography.small, color: colors.primary[600], fontWeight: '700', fontSize: 13 },
  dhikrContentContainer: { flex: 1 },
  arabicText: { fontSize: 20, color: colors.ink.primary, textAlign: 'left', marginBottom: 8, lineHeight: 32 },
  translitText: { ...typography.body, color: colors.ink.secondary, textAlign: 'left', fontStyle: 'italic', marginBottom: 6, fontSize: 15 },
  translationText: { ...typography.body, color: colors.ink.primary, textAlign: 'left', lineHeight: 22, marginBottom: 8 },
  targetText: { ...typography.small, color: colors.primary[600], fontWeight: '600', fontSize: 13 },

  // Counter modal
  counterContainer: { flex: 1, backgroundColor: colors.gradient.start, justifyContent: 'center', alignItems: 'center', padding: 20 },
  counterCloseButton: { position: 'absolute', top: 60, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  counterCloseText: { color: colors.surface, fontSize: 18, fontWeight: '700' },
  counterContent: { alignItems: 'center', width: '100%' },
  counterRoutineName: { ...typography.h2, color: colors.surface, marginBottom: 24, fontSize: 24, textAlign: 'center' },
  counterControlsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  smallCtrlBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  progressContainer: { width: '100%', alignItems: 'center', marginBottom: 28 },
  progressBar: { width: '85%', height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: colors.surface, borderRadius: 3 },
  progressText: { ...typography.body, color: colors.surface, fontSize: 16, fontWeight: '600' },

  counterDhikrContent: { alignItems: 'center', marginBottom: 40, paddingHorizontal: 20 },
  counterArabic: { fontSize: 32, color: colors.surface, textAlign: 'center', marginBottom: 16, lineHeight: 44 },
  counterTranslit: { ...typography.h2, color: colors.surface, opacity: 0.9, textAlign: 'center', fontStyle: 'italic', marginBottom: 10, fontSize: 18 },
  counterTranslation: { ...typography.body, color: colors.surface, opacity: 0.95, textAlign: 'center', fontSize: 16, lineHeight: 24 },
  counterButton: {
    width: 140, height: 140, borderRadius: 70, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)',
  },
  counterButtonText: { fontSize: 42, fontWeight: '800', color: colors.gradient.start },

  // DONE view
  doneWrap: { alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  doneBadge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', marginBottom: 20,
  },
  doneTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  doneSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, textAlign: 'center', marginBottom: 28 },
  doneButtons: { flexDirection: 'row', gap: 12 },
  doneBtn: { paddingVertical: 14, paddingHorizontal: 22, borderRadius: 12, borderWidth: 1 },
  donePrimary: { backgroundColor: '#fff', borderColor: 'rgba(255,255,255,0.2)' },
  donePrimaryText: { color: colors.gradient.start, fontWeight: '800', fontSize: 16 },
  doneGhost: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.35)' },
  doneGhostText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Create modal
  createModalContainer: { flex: 1, backgroundColor: colors.bg },
  createModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  createModalTitle: { ...typography.h2, color: colors.ink.primary, fontSize: 20 },
  createModalClose: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  inputLabel: { ...typography.body, color: colors.ink.primary, fontWeight: '600', marginBottom: 8, fontSize: 16 },
  routineNameInput: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, fontSize: 16, color: colors.ink.primary, borderWidth: 1, borderColor: colors.border },

  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, color: colors.ink.primary },
  clearBtn: { padding: 6, borderRadius: 8, backgroundColor: '#00000010', marginLeft: 8 },

  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },

  selectedItemCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary[500] + '30' },
  selectedItemArabic: { fontSize: 16, color: colors.ink.primary, marginBottom: 4 },
  selectedItemTranslit: { ...typography.small, color: colors.ink.secondary, fontStyle: 'italic', fontSize: 13 },
  selectedItemControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  targetControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: 8, padding: 4 },
  targetButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  targetValue: { ...typography.body, color: colors.ink.primary, fontWeight: '600', minWidth: 32, textAlign: 'center', fontSize: 14 },
  removeItemButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.status.missed + '15', alignItems: 'center', justifyContent: 'center' },

  sectionHeaderChip: { backgroundColor: '#F8FAFC', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, marginTop: 12, borderWidth: 1, borderColor: colors.border, alignSelf: 'flex-start' },
  sectionHeaderChipText: { color: colors.ink.secondary, fontWeight: '800', textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.6 },

  availableDhikrCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginTop: 8 },
  availableDhikrCardSelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[500] + '08' },
  availableDhikrInfo: { flex: 1 },
  availableDhikrArabic: { fontSize: 16, color: colors.ink.primary, marginBottom: 4 },
  availableDhikrTranslit: { ...typography.small, color: colors.ink.secondary, fontStyle: 'italic', marginBottom: 2, fontSize: 13 },
  availableDhikrTranslation: { ...typography.small, color: colors.ink.secondary, fontSize: 12 },
  availableDhikrCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  availableDhikrCheckSelected: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },

  createModalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  saveRoutineButton: { backgroundColor: colors.primary[500], borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: colors.primary[500], shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  saveRoutineText: { ...typography.body, color: colors.surface, fontWeight: '700', fontSize: 16 },
});
