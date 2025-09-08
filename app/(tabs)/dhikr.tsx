// app/(tabs)/dhikr.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  FlatList,
  SectionList,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import {
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Check,
  Search,
  Filter,
  X,
} from 'lucide-react-native';
import { useDhikrStore } from '@/src/store/dhikr-store';

// OPTIONAL haptics (Expo). In bare RN valt dit netjes weg.
let Haptics: any = null;
try {
  // @ts-ignore
  Haptics = require('expo-haptics');
} catch (_) {}

interface DhikrItem {
  id: string;
  text: string;
  transliteration: string;
  translation: string;
  count: number;
  category: string;
}

const AVAILABLE_DHIKR: DhikrItem[] = [
  // --- zelfde dataset als jouw originele, licht ingekort voor leesbaarheid ---
  { id: '1', text: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhan Allah', translation: 'Glory be to Allah', count: 33, category: 'Tasbih' },
  { id: '2', text: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation: 'Praise be to Allah', count: 33, category: 'Tahmid' },
  { id: '3', text: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', count: 34, category: 'Takbir' },
  { id: '4', text: 'لَا إِلَهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illa Allah', translation: 'There is no god but Allah', count: 100, category: 'Tahlil' },
  { id: '5', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subhan Allahi wa bihamdihi', translation: 'Glory be to Allah and praise Him', count: 100, category: 'Tasbih' },
  { id: '6', text: 'سُبْحَانَ اللَّهِ الْعَظِيمِ', transliteration: 'Subhan Allahi al-Azeem', translation: 'Glory be to Allah, the Magnificent', count: 100, category: 'Tasbih' },
  { id: '7', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ', transliteration: 'Subhan Allahi wa bihamdihi, Subhan Allahi al-Azeem', translation: 'Glory be to Allah and praise Him, Glory be to Allah the Magnificent', count: 100, category: 'Tasbih' },
  { id: '8', text: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', count: 100, category: 'Istighfar' },
  { id: '9', text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ ...', transliteration: 'Astaghfirullah al-Azeem ...', translation: 'I seek forgiveness from Allah the Mighty...', count: 100, category: 'Istighfar' },
  { id: '10', text: 'رَبِّ اغْفِرْ لِي ...', transliteration: 'Rabbi ghfir li ...', translation: 'My Lord, forgive me...', count: 100, category: 'Istighfar' },
  { id: '11', text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allahumma salli ala Muhammad', translation: 'O Allah, send blessings upon Muhammad', count: 100, category: 'Salawat' },
  { id: '12', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ ...', transliteration: 'Allahumma salli wa sallim ...', translation: 'O Allah, send blessings and peace...', count: 100, category: 'Salawat' },
  { id: '13', text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ ...', transliteration: 'Allahumma salli ala Muhammad ...', translation: 'O Allah, send blessings upon Muhammad and family', count: 100, category: 'Salawat' },
  { id: '14', text: 'لَا حَوْلَ وَلَا قُوَّةَ ...', transliteration: 'La hawla wa la quwwata ...', translation: 'There is no power except with Allah', count: 100, category: 'Hawqala' },
  { id: '15', text: 'حَسْبُنَا اللَّهُ ...', transliteration: "Hasbuna Allahu wa ni'ma al-wakeel", translation: 'Allah is sufficient for us...', count: 100, category: 'Tawakkul' },
  { id: '16', text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ ...', transliteration: 'La ilaha illa Allah wahdahu ...', translation: 'There is no god but Allah alone...', count: 100, category: 'Tahlil' },
  { id: '17', text: 'لَا إِلَهَ إِلَّا اللَّهُ ... قَدِيرٌ', transliteration: "La ilaha illa Allah ... qadeer", translation: 'There is no god but Allah ... all things', count: 100, category: 'Tahlil' },
  { id: '18', text: 'يَا رَحْمَانُ', transliteration: 'Ya Rahman', translation: 'O Most Merciful', count: 100, category: 'Asma ul-Husna' },
  { id: '19', text: 'يَا رَحِيمُ', transliteration: 'Ya Raheem', translation: 'O Most Compassionate', count: 100, category: 'Asma ul-Husna' },
  { id: '20', text: 'يَا غَفَّارُ', transliteration: 'Ya Ghaffar', translation: 'O Oft-Forgiving', count: 100, category: 'Asma ul-Husna' },
  { id: '21', text: 'يَا كَرِيمُ', transliteration: 'Ya Kareem', translation: 'O Most Generous', count: 100, category: 'Asma ul-Husna' },
  { id: '22', text: 'يَا لَطِيفُ', transliteration: 'Ya Lateef', translation: 'O Most Gentle', count: 100, category: 'Asma ul-Husna' },
  { id: '23', text: 'رَبَّنَا آتِنَا ...', transliteration: "Rabbana atina ...", translation: 'Our Lord, give us good...', count: 100, category: 'Dua' },
  { id: '24', text: 'رَبِّ اشْرَحْ لِي ...', transliteration: 'Rabbi shrah li ...', translation: 'My Lord, expand my chest...', count: 100, category: 'Dua' },
  { id: '25', text: 'رَبِّ زِدْنِي عِلْمًا', transliteration: 'Rabbi zidni ilma', translation: 'My Lord, increase me in knowledge', count: 100, category: 'Dua' },
  { id: '26', text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا ...', transliteration: 'Rabbana la tuzigh qulubana ...', translation: 'Our Lord, do not let our hearts deviate...', count: 100, category: 'Dua' },
  { id: '27', text: 'أَعُوذُ بِاللَّهِ ...', transliteration: "A'udhu billahi ...", translation: 'I seek refuge in Allah...', count: 3, category: 'Protection' },
  { id: '28', text: 'بِسْمِ اللَّهِ الَّذِي ...', transliteration: "Bismillahi'lladhi ...", translation: 'In the name of Allah ...', count: 3, category: 'Protection' },
  { id: '29', text: 'اللَّهُمَّ أَنْتَ رَبِّي ...', transliteration: 'Allahumma anta rabbi ...', translation: 'O Allah, You are my Lord...', count: 1, category: 'Morning/Evening' },
  { id: '30', text: 'رَضِيتُ بِاللَّهِ ...', transliteration: 'Radeetu billahi ...', translation: 'I am pleased with Allah ...', count: 3, category: 'Morning/Evening' },
];

const CATEGORIES = ['All', ...Array.from(new Set(AVAILABLE_DHIKR.map(d => d.category)))];

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [selectedDhikr, setSelectedDhikr] = useState<string[]>([]);
  const [customCounts, setCustomCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');

  // Smooth progress animation
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progress = activeRoutine ? (currentDhikrIndex / Math.max(1, activeRoutine.dhikrList.length)) : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const currentDhikr = activeRoutine?.dhikrList[currentDhikrIndex];

  // Filtering for modal
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AVAILABLE_DHIKR.filter(d => {
      if (category !== 'All' && d.category !== category) return false;
      if (!q) return true;
      return (
        d.text.toLowerCase().includes(q) ||
        d.transliteration.toLowerCase().includes(q) ||
        d.translation.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const grouped = useMemo(() => {
    const by: Record<string, DhikrItem[]> = {};
    for (const d of filtered) {
      if (!by[d.category]) by[d.category] = [];
      by[d.category].push(d);
    }
    return Object.keys(by).sort().map(k => ({ title: k, data: by[k] }));
  }, [filtered]);

  // Actions
  const onTapCount = () => {
    if (Haptics?.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    incrementCount();
  };
  const onLongPressCount = () => {
    for (let i = 0; i < 10; i++) incrementCount();
    if (Haptics?.notificationAsync) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const onTogglePlay = () => {
    if (!activeRoutine) return;
    if (isActive) pauseRoutine();
    else startRoutine(activeRoutine.id); // resume/start fix
  };

  const handleCreateRoutine = () => {
    if (!routineName.trim()) {
      Alert.alert('Naam vereist', 'Geef je routine een naam.');
      return;
    }
    if (selectedDhikr.length === 0) {
      Alert.alert('Selectie vereist', 'Kies minstens één dhikr.');
      return;
    }
    const dhikrItems = selectedDhikr.map(id => {
      const d = AVAILABLE_DHIKR.find(x => x.id === id)!;
      return { ...d, count: customCounts[id] || d.count };
    });
    createRoutine({ name: routineName.trim(), dhikrList: dhikrItems });

    setShowCreateModal(false);
    setRoutineName('');
    setSelectedDhikr([]);
    setCustomCounts({});
    setQuery('');
    setCategory('All');
  };

  const toggleDhikrSelection = (id: string) => {
    setSelectedDhikr(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };
  const updateCustomCount = (id: string, count: number) => {
    setCustomCounts(prev => ({ ...prev, [id]: Math.max(1, count || 1) }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Dhikr</Text>
          <Text style={styles.subtitle}>Focus • Rust • Consistentie</Text>
        </View>
        <Pressable
          onPress={() => setShowCreateModal(true)}
          style={({ pressed }) => [styles.iconBtn, styles.primary, pressed && styles.pressed]}
          accessibilityLabel="Nieuwe routine"
        >
          <Plus color="#fff" size={20} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Active Routine Card */}
        {activeRoutine ? (
          <View style={styles.activeCard}>
            {/* Sub-header */}
            <View style={styles.activeHeader}>
              <View>
                <Text style={styles.activeName}>{activeRoutine.name}</Text>
                <Text style={styles.activeMeta}>
                  {currentDhikrIndex + 1} / {activeRoutine.dhikrList.length} • {activeRoutine.dhikrList.reduce((s, d) => s + d.count, 0)} totaal
                </Text>
              </View>
              <View style={styles.controlsRow}>
                <Pressable
                  onPress={resetRoutine}
                  style={({ pressed }) => [styles.ctrlBtn, styles.soft, pressed && styles.pressed]}
                  accessibilityLabel="Reset routine"
                >
                  <RotateCcw color={COLORS.ink} size={20} />
                </Pressable>
                <Pressable
                  onPress={onTogglePlay}
                  style={({ pressed }) => [styles.ctrlBtn, isActive ? styles.warn : styles.primary, pressed && styles.pressed]}
                  accessibilityLabel={isActive ? 'Pauzeer' : 'Start'}
                >
                  {isActive ? <Pause color="#fff" size={20} /> : <Play color="#fff" size={20} />}
                </Pressable>
                <Pressable
                  onPress={nextDhikr}
                  style={({ pressed }) => [styles.ctrlBtn, styles.soft, pressed && styles.pressed]}
                  accessibilityLabel="Volgende dhikr"
                >
                  <Check color={COLORS.ink} size={20} />
                </Pressable>
              </View>
            </View>

            {/* Progress */}
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Dhikr display */}
            <View style={styles.dhikrArea}>
              <Text style={styles.arabic} accessibilityLabel="Dhikr (Arabisch)">
                {currentDhikr?.text}
              </Text>
              <Text style={styles.translit}>{currentDhikr?.transliteration}</Text>
              <Text style={styles.translation}>{currentDhikr?.translation}</Text>

              <View style={styles.counterPill}>
                <Text style={styles.counterText}>
                  {currentCount} <Text style={styles.counterTotal}>/ {currentDhikr?.count}</Text>
                </Text>
              </View>

              <Pressable
                onPress={onTapCount}
                onLongPress={onLongPressCount}
                android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                style={({ pressed }) => [styles.countBtn, pressed && styles.countBtnPressed]}
                accessibilityRole="button"
                accessibilityLabel="Tel tik"
              >
                <Text style={styles.countLabel}>TAP TO COUNT</Text>
                <Text style={styles.countHint}>Long-press = +10</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Klaar om te starten</Text>
            <Text style={styles.emptyText}>Maak een routine of kies er één uit je lijst.</Text>
          </View>
        )}

        {/* Routines List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mijn routines</Text>
          {routines.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptySubtle}>Nog geen routines</Text>
              <Text style={styles.emptyHelp}>Tik op + om je eerste routine te maken</Text>
            </View>
          ) : (
            routines.map((r: any) => (
              <View key={r.id} style={styles.routineCard} accessible accessibilityRole="button">
                <View style={{ flex: 1 }}>
                  <Text style={styles.routineName}>{r.name}</Text>
                  <Text style={styles.routineMeta}>
                    {r.dhikrList.length} dhikr • {r.dhikrList.reduce((sum: number, d: any) => sum + d.count, 0)} totaal
                  </Text>
                </View>
                <View style={styles.routineActions}>
                  <Pressable
                    onPress={() => startRoutine(r.id)}
                    style={({ pressed }) => [styles.iconBtn, styles.primarySoft, pressed && styles.pressed]}
                    accessibilityLabel={`Start ${r.name}`}
                  >
                    <Play color={COLORS.primaryDark} size={18} />
                  </Pressable>
                  <Pressable
                    onPress={() => deleteRoutine(r.id)}
                    style={({ pressed }) => [styles.iconBtn, styles.dangerSoft, pressed && styles.pressed]}
                    accessibilityLabel={`Verwijder ${r.name}`}
                  >
                    <Trash2 color={COLORS.dangerDark} size={18} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Routine Modal */}
      <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowCreateModal(false)} style={({ pressed }) => [styles.textBtn, pressed && styles.textPressed]}>
              <Text style={styles.cancel}>Annuleer</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Nieuwe routine</Text>
            <Pressable onPress={handleCreateRoutine} style={({ pressed }) => [styles.textBtn, pressed && styles.textPressed]}>
              <Text style={styles.save}>Bewaar</Text>
            </Pressable>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.label}>Naam</Text>
            <TextInput
              style={styles.input}
              value={routineName}
              onChangeText={setRoutineName}
              placeholder="Bijv. Ochtend dhikr"
              placeholderTextColor="#9CA3AF"
              returnKeyType="done"
            />

            {/* Filters */}
            <View style={styles.filtersRow}>
              <View style={styles.searchWrap}>
                <Search size={16} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Zoek tekst / transliteratie / vertaling"
                  placeholderTextColor="#94A3B8"
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <Pressable onPress={() => setQuery('')} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]} accessibilityLabel="Wis zoekopdracht">
                    <X size={14} color="#64748B" />
                  </Pressable>
                )}
              </View>

              <View style={styles.filterBadge}>
                <Filter size={16} color="#0F172A" />
                <Text style={styles.filterText}>Filter</Text>
              </View>
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
                      selected ? styles.chipActive : styles.chipIdle,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={selected ? styles.chipTextActive : styles.chipTextIdle}>{item}</Text>
                  </Pressable>
                );
              }}
            />

            {/* Grouped list by category */}
            <SectionList
              sections={grouped}
              keyExtractor={(item) => item.id}
              stickySectionHeadersEnabled
              style={{ marginTop: 8 }}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              renderItem={({ item }) => {
                const isSelected = selectedDhikr.includes(item.id);
                return (
                  <Pressable
                    onPress={() => toggleDhikrSelection(item.id)}
                    style={({ pressed }) => [styles.optionCard, isSelected && styles.optionActive, pressed && styles.pressed]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optArabic}>{item.text}</Text>
                      <Text style={styles.optTranslit}>{item.transliteration}</Text>
                      <Text style={styles.optTranslation}>{item.translation}</Text>

                      {isSelected && (
                        <View style={styles.countRow}>
                          <Text style={styles.countLabel}>Aantal</Text>
                          <View style={styles.countStepper}>
                            <Pressable
                              onPress={() => updateCustomCount(item.id, (customCounts[item.id] || item.count) - 1)}
                              style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
                              accessibilityLabel="Verlaag aantal"
                            >
                              <Text style={styles.stepText}>−</Text>
                            </Pressable>
                            <TextInput
                              style={styles.countInput}
                              keyboardType="number-pad"
                              value={String(customCounts[item.id] ?? item.count)}
                              onChangeText={(t) => updateCustomCount(item.id, Math.max(1, parseInt(t || '0', 10)))}
                            />
                            <Pressable
                              onPress={() => updateCustomCount(item.id, (customCounts[item.id] || item.count) + 1)}
                              style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
                              accessibilityLabel="Verhoog aantal"
                            >
                              <Text style={styles.stepText}>+</Text>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>
                    <View style={[styles.checkBox, isSelected && styles.checkBoxActive]}>
                      {isSelected && <Check color="#fff" size={16} />}
                    </View>
                  </Pressable>
                );
              }}
              ListFooterComponent={<View style={{ height: 32 }} />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/** LIGHT “TECHY” THEME **/
const COLORS = {
  bg: '#F7FAFC', // licht, clean
  card: '#FFFFFF',
  glass: 'rgba(255,255,255,0.86)',
  border: '#E5EEF6',
  ink: '#0F172A',
  sub: '#64748B',
  subtle: '#94A3B8',
  primary: '#10B981', // emerald
  primaryDark: '#065F46',
  primarySoftBg: '#ECFDF5',
  warn: '#F59E0B',
  dangerSoftBg: '#FEF2F2',
  dangerDark: '#991B1B',
  track: '#E6EEF7',
  fill: '#10B981',
  chipIdleBg: '#F1F5F9',
  chipActiveBg: '#DCFCE7',
};

const RADIUS = 16;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  headerLeft: { gap: 2 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.ink, letterSpacing: 0.2 },
  subtitle: { color: COLORS.sub, fontSize: 12 },

  content: { padding: 16, paddingBottom: 32 },

  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  primary: { backgroundColor: COLORS.primary },
  primarySoft: { backgroundColor: COLORS.primarySoftBg },
  dangerSoft: { backgroundColor: COLORS.dangerSoftBg },
  soft: { backgroundColor: '#F3F6FA' },
  warn: { backgroundColor: COLORS.warn },
  pressed: { opacity: 0.85 },

  /* Active card */
  activeCard: {
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    // glossy shadow
    shadowColor: '#A3B7D6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 3,
  },
  activeHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  activeName: { color: COLORS.ink, fontWeight: '800', fontSize: 18 },
  activeMeta: { color: COLORS.subtle },

  controlsRow: { flexDirection: 'row', gap: 10 },
  ctrlBtn: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },

  progressWrap: { marginBottom: 12 },
  progressTrack: {
    height: 10, borderRadius: 999,
    backgroundColor: COLORS.track, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.fill },

  dhikrArea: { alignItems: 'center', paddingVertical: 8 },
  arabic: {
    fontSize: 28, lineHeight: 40, textAlign: 'center',
    color: COLORS.ink, fontWeight: '800', marginBottom: 6,
  },
  translit: { fontSize: 15, color: COLORS.primaryDark, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  translation: { fontSize: 14, color: COLORS.sub, fontStyle: 'italic', textAlign: 'center', marginBottom: 12 },

  counterPill: {
    backgroundColor: '#F5FBF9',
    borderColor: COLORS.border, borderWidth: 1,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginBottom: 16,
  },
  counterText: { color: COLORS.ink, fontSize: 20, fontWeight: '900' },
  counterTotal: { color: COLORS.sub, fontWeight: '700' },

  countBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 2,
  },
  countBtnPressed: { transform: [{ scale: 0.995 }] },
  countLabel: { color: '#fff', fontWeight: '900', letterSpacing: 1, fontSize: 16 },
  countHint: { color: '#ECFDF5', opacity: 0.9, marginTop: 4, fontSize: 12 },

  /* Empty */
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 16,
  },
  emptyTitle: { color: COLORS.ink, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyText: { color: COLORS.sub },

  /* Section */
  section: { marginTop: 8 },
  sectionTitle: { color: COLORS.ink, fontSize: 18, fontWeight: '800', marginBottom: 10 },

  /* Routine list */
  routineCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  routineName: { color: COLORS.ink, fontWeight: '800', fontSize: 16 },
  routineMeta: { color: COLORS.sub, marginTop: 2 },
  routineActions: { flexDirection: 'row', gap: 8 },

  /* Modal */
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border,
  },
  modalTitle: { color: COLORS.ink, fontWeight: '800', fontSize: 16 },
  textBtn: { padding: 8 },
  textPressed: { opacity: 0.7 },
  cancel: { color: COLORS.sub, fontWeight: '700' },
  save: { color: COLORS.primaryDark, fontWeight: '800' },

  modalBody: { padding: 16 },
  label: { color: COLORS.ink, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.ink, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 14,
  },

  filtersRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  searchInput: { flex: 1, color: COLORS.ink, paddingVertical: 0 },
  clearBtn: { padding: 4, borderRadius: 8, backgroundColor: '#0000000e' },

  filterBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 10, paddingVertical: 10,
  },
  filterText: { color: COLORS.ink, fontWeight: '700' },

  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginRight: 8, borderWidth: 1 },
  chipIdle: { backgroundColor: COLORS.chipIdleBg, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.chipActiveBg, borderColor: '#86EFAC' },
  chipTextIdle: { color: COLORS.sub, fontWeight: '700' },
  chipTextActive: { color: COLORS.primaryDark, fontWeight: '800' },

  sectionHeader: {
    backgroundColor: '#F8FAFC', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 10, marginTop: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sectionHeaderText: { color: COLORS.sub, fontWeight: '800', textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.7 },

  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, marginTop: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  optionActive: { borderColor: COLORS.primary, backgroundColor: '#F9FFFC' },
  checkBox: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkBoxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optArabic: { color: COLORS.ink, fontWeight: '800', fontSize: 16, marginBottom: 4 },
  optTranslit: { color: COLORS.primaryDark, fontWeight: '700' },
  optTranslation: { color: COLORS.sub, fontStyle: 'italic', marginTop: 4 },

  countRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  countLabel: { color: COLORS.sub, width: 60 },
  countStepper: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  stepBtn: {
    width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  stepText: { color: COLORS.ink, fontSize: 18, fontWeight: '900', lineHeight: 20 },
  countInput: {
    minWidth: 52, textAlign: 'center', color: COLORS.ink, paddingVertical: 4,
  },

  emptyList: { alignItems: 'center', paddingVertical: 24 },
  emptySubtle: { color: COLORS.sub, fontWeight: '600' },
  emptyHelp: { color: COLORS.sub, marginTop: 4 },
});
