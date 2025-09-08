// DhikrScreen.tsx
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
  Filter,
  Search,
  X,
} from 'lucide-react-native';
import { useDhikrStore } from '@/src/store/dhikr-store';

// OPTIONAL (haptics): werkt automatisch in Expo.
// In bare RN zonder expo-haptics blijft alles netjes werken (fallback).
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
  // --- jouw originele lijst ongewijzigd ---
  { id: '1', text: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhan Allah', translation: 'Glory be to Allah', count: 33, category: 'Tasbih' },
  { id: '2', text: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation: 'Praise be to Allah', count: 33, category: 'Tahmid' },
  { id: '3', text: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', count: 34, category: 'Takbir' },
  { id: '4', text: 'لَا إِلَهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illa Allah', translation: 'There is no god but Allah', count: 100, category: 'Tahlil' },
  { id: '5', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subhan Allahi wa bihamdihi', translation: 'Glory be to Allah and praise Him', count: 100, category: 'Tasbih' },
  { id: '6', text: 'سُبْحَانَ اللَّهِ الْعَظِيمِ', transliteration: 'Subhan Allahi al-Azeem', translation: 'Glory be to Allah, the Magnificent', count: 100, category: 'Tasbih' },
  { id: '7', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ', transliteration: 'Subhan Allahi wa bihamdihi, Subhan Allahi al-Azeem', translation: 'Glory be to Allah and praise Him, Glory be to Allah the Magnificent', count: 100, category: 'Tasbih' },
  { id: '8', text: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', count: 100, category: 'Istighfar' },
  { id: '9', text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', transliteration: 'Astaghfirullah al-Azeem alladhi la ilaha illa Huwa al-Hayy al-Qayyum wa atubu ilayh', translation: 'I seek forgiveness from Allah the Mighty, whom there is no god but He, the Living, the Eternal, and I repent to Him', count: 100, category: 'Istighfar' },
  { id: '10', text: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', transliteration: 'Rabbi ghfir li wa tub alayya innaka anta at-Tawwab ar-Raheem', translation: 'My Lord, forgive me and accept my repentance, indeed You are the Oft-Returning, the Merciful', count: 100, category: 'Istighfar' },
  { id: '11', text: 'اللَّّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allahumma salli ala Muhammad', translation: 'O Allah, send blessings upon Muhammad', count: 100, category: 'Salawat' },
  { id: '12', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', transliteration: 'Allahumma salli wa sallim ala nabiyyina Muhammad', translation: 'O Allah, send blessings and peace upon our Prophet Muhammad', count: 100, category: 'Salawat' },
  { id: '13', text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ', transliteration: 'Allahumma salli ala Muhammad wa ala ali Muhammad', translation: 'O Allah, send blessings upon Muhammad and the family of Muhammad', count: 100, category: 'Salawat' },
  { id: '14', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'La hawla wa la quwwata illa billah', translation: 'There is no power except with Allah', count: 100, category: 'Hawqala' },
  { id: '15', text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", transliteration: "Hasbuna Allahu wa ni'ma al-wakeel", translation: 'Allah is sufficient for us and He is the best Disposer of affairs', count: 100, category: 'Tawakkul' },
  { id: '16', text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: 'La ilaha illa Allah wahdahu la shareeka lah', translation: 'There is no god but Allah alone, with no partner', count: 100, category: 'Tahlil' },
  { id: '17', text: "لَا إِلَهَ إِلَّا اللَّهُ ... عَلَى كُلِّ شَيْءٍ قَدِيرٌ", transliteration: "La ilaha illa Allah wahdahu ... wa huwa ala kulli shay'in qadeer", translation: 'There is no god but Allah alone... and He is able to do all things', count: 100, category: 'Tahlil' },
  { id: '18', text: 'يَا رَحْمَانُ', transliteration: 'Ya Rahman', translation: 'O Most Merciful', count: 100, category: 'Asma ul-Husna' },
  { id: '19', text: 'يَا رَحِيمُ', transliteration: 'Ya Raheem', translation: 'O Most Compassionate', count: 100, category: 'Asma ul-Husna' },
  { id: '20', text: 'يَا غَفَّارُ', transliteration: 'Ya Ghaffar', translation: 'O Oft-Forgiving', count: 100, category: 'Asma ul-Husna' },
  { id: '21', text: 'يَا كَرِيمُ', transliteration: 'Ya Kareem', translation: 'O Most Generous', count: 100, category: 'Asma ul-Husna' },
  { id: '22', text: 'يَا لَطِيفُ', transliteration: 'Ya Lateef', translation: 'O Most Gentle', count: 100, category: 'Asma ul-Husna' },
  { id: '23', text: 'رَبَّنَا آتِنَا ... عَذَابَ النَّارِ', transliteration: "Rabbana atina fi'd-dunya ... adhab an-nar", translation: 'Our Lord, give us good in this world and in the next...', count: 100, category: 'Dua' },
  { id: '24', text: 'رَبِّ اشْرَحْ لِي صَدْرِي ...', transliteration: 'Rabbi shrah li sadri wa yassir li amri', translation: 'My Lord, expand my chest and make my task easy for me', count: 100, category: 'Dua' },
  { id: '25', text: 'رَبِّ زِدْنِي عِلْمًا', transliteration: 'Rabbi zidni ilma', translation: 'My Lord, increase me in knowledge', count: 100, category: 'Dua' },
  { id: '26', text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا ...', transliteration: 'Rabbana la tuzigh qulubana ...', translation: 'Our Lord, do not let our hearts deviate...', count: 100, category: 'Dua' },
  { id: '27', text: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ', transliteration: "A'udhu billahi min ash-shaytan ir-rajeem", translation: 'I seek refuge in Allah from Satan, the accursed', count: 3, category: 'Protection' },
  { id: '28', text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ ...', transliteration: "Bismillahi'lladhi la yadurru ...", translation: 'In the name of Allah with whose name nothing is harmed...', count: 3, category: 'Protection' },
  { id: '29', text: 'اللَّهُمَّ أَنْتَ رَبِّي ...', transliteration: 'Allahumma anta rabbi ...', translation: 'O Allah, You are my Lord...', count: 1, category: 'Morning/Evening' },
  { id: '30', text: 'رَضِيتُ بِاللَّهِ رَبًّا ...', transliteration: 'Radeetu billahi rabban ...', translation: 'I am pleased with Allah as my Lord...', count: 3, category: 'Morning/Evening' },
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

  // Animated progress (smooth)
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
    setCustomCounts(prev => ({ ...prev, [id]: count > 0 ? count : 1 }));
  };

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
    const byCat: Record<string, DhikrItem[]> = {};
    for (const d of filtered) {
      if (!byCat[d.category]) byCat[d.category] = [];
      byCat[d.category].push(d);
    }
    return Object.keys(byCat).sort().map(k => ({ title: k, data: byCat[k] }));
  }, [filtered]);

  const onTapCount = () => {
    if (Haptics?.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    incrementCount();
  };

  const onLongPressCount = () => {
    // +10 bij long-press → snel vooruit
    for (let i = 0; i < 10; i++) incrementCount();
    if (Haptics?.notificationAsync) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const onTogglePlay = () => {
    if (!activeRoutine) return;
    if (isActive) {
      pauseRoutine();
    } else {
      // Resume/start active routine (fix t.o.v. eerdere no-op)
      startRoutine(activeRoutine.id);
    }
  };

  const headerElevation = Platform.select({ ios: 0, android: 2 });

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.header, { elevation: headerElevation }]}>
        <Text style={styles.title} accessibilityRole="header">Dhikr</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Nieuwe routine"
            onPress={() => setShowCreateModal(true)}
            style={({ pressed }) => [styles.iconBtn, styles.primary, pressed && styles.pressed]}
          >
            <Plus color="#fff" size={20} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Active Routine */}
        {activeRoutine ? (
          <View style={styles.card}>
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
              <Text style={styles.progressText}>
                {currentDhikrIndex + 1} / {activeRoutine.dhikrList.length}
              </Text>
            </View>

            {/* Dhikr Content */}
            <View style={styles.dhikrBlock}>
              <Text style={styles.arabic} accessibilityLabel="Dhikr in het Arabisch">
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
                android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
                accessibilityRole="button"
                accessibilityLabel="Tel tik"
                style={({ pressed }) => [styles.tapButton, pressed && styles.tapPressed]}
              >
                <Text style={styles.tapLabel}>TAP TO COUNT</Text>
                <Text style={styles.tapHint}>Long-press = +10</Text>
              </Pressable>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <Pressable
                onPress={resetRoutine}
                accessibilityLabel="Reset routine"
                style={({ pressed }) => [styles.ctrlBtn, pressed && styles.pressed]}
              >
                <RotateCcw color="#0F172A" size={22} />
              </Pressable>

              <Pressable
                onPress={onTogglePlay}
                accessibilityLabel={isActive ? 'Pauzeer' : 'Start'}
                style={({ pressed }) => [
                  styles.playBtn,
                  isActive ? styles.warning : styles.primary,
                  pressed && styles.pressed,
                ]}
              >
                {isActive ? <Pause color="#fff" size={26} /> : <Play color="#fff" size={26} />}
              </Pressable>

              <Pressable
                onPress={nextDhikr}
                accessibilityLabel="Volgende dhikr"
                style={({ pressed }) => [styles.ctrlBtn, pressed && styles.pressed]}
              >
                <Check color="#0F172A" size={22} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Begin met een routine</Text>
            <Text style={styles.emptyText}>Maak een routine of kies er één uit je lijst.</Text>
          </View>
        )}

        {/* My Routines */}
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
                    {r.dhikrList.length} dhikr •{' '}
                    {r.dhikrList.reduce((sum: number, d: any) => sum + d.count, 0)} totaal
                  </Text>
                </View>
                <View style={styles.routineActions}>
                  <Pressable
                    onPress={() => startRoutine(r.id)}
                    style={({ pressed }) => [styles.iconBtn, styles.softPrimary, pressed && styles.pressed]}
                    accessibilityLabel={`Start ${r.name}`}
                  >
                    <Play color="#065F46" size={18} />
                  </Pressable>
                  <Pressable
                    onPress={() => deleteRoutine(r.id)}
                    style={({ pressed }) => [styles.iconBtn, styles.softDanger, pressed && styles.pressed]}
                    accessibilityLabel={`Verwijder ${r.name}`}
                  >
                    <Trash2 color="#991B1B" size={18} />
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
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowCreateModal(false)} style={({ pressed }) => [styles.textBtn, pressed && styles.textPressed]}>
              <Text style={styles.cancel}>Annuleer</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Nieuwe routine</Text>
            <Pressable onPress={handleCreateRoutine} style={({ pressed }) => [styles.textBtn, pressed && styles.textPressed]}>
              <Text style={styles.save}>Bewaar</Text>
            </Pressable>
          </View>

          {/* Name */}
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

            {/* Search + Category chips */}
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
                  <Pressable onPress={() => setQuery('')} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
                    <X size={14} color="#64748B" />
                  </Pressable>
                )}
              </View>

              <View style={styles.filterIcon}>
                <Filter size={16} color="#475569" />
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

            {/* Dhikr selection list (grouped by category) */}
            <SectionList
              sections={grouped}
              keyExtractor={(item) => item.id}
              style={{ marginTop: 8 }}
              stickySectionHeadersEnabled
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

const COLORS = {
  bg: '#0B1220', // deep slate
  card: '#0F172A', // slate-900
  softCard: '#111827', // gray-900
  text: '#E5E7EB', // gray-200
  sub: '#94A3B8', // slate-400
  accent: '#059669', // emerald-600
  accentSoft: '#D1FAE5', // emerald-100
  accentText: '#065F46',
  dangerSoft: '#FEE2E2',
  dangerText: '#991B1B',
  border: '#243046',
  track: '#1F2937',
  fill: '#10B981',
  chipIdleBg: '#0B2530',
  chipActiveBg: '#064E3B',
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
  },
  headerActions: { flexDirection: 'row', gap: 10 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, letterSpacing: 0.2 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  primary: { backgroundColor: COLORS.accent },
  softPrimary: { backgroundColor: COLORS.accentSoft },
  softDanger: { backgroundColor: COLORS.dangerSoft },
  warning: { backgroundColor: '#F59E0B' },
  pressed: { opacity: 0.7 },
  content: { padding: 16, paddingBottom: 32 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },

  progressWrap: { marginBottom: 14 },
  progressTrack: {
    height: 10, borderRadius: 999,
    backgroundColor: COLORS.track, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.fill },
  progressText: { marginTop: 8, textAlign: 'center', color: COLORS.sub, fontWeight: '600' },

  dhikrBlock: { alignItems: 'center', paddingVertical: 8 },
  arabic: {
    fontSize: 30, lineHeight: 42, textAlign: 'center',
    color: COLORS.text, fontWeight: '700', marginBottom: 8,
  },
  translit: { fontSize: 16, color: COLORS.accent, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  translation: { fontSize: 14, color: COLORS.sub, fontStyle: 'italic', textAlign: 'center', marginBottom: 18 },

  counterPill: {
    backgroundColor: '#0D1C24',
    borderColor: COLORS.border, borderWidth: 1,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginBottom: 16,
  },
  counterText: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  counterTotal: { color: COLORS.sub, fontWeight: '700' },

  tapButton: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  tapPressed: { opacity: 0.9 },
  tapLabel: { color: '#fff', fontWeight: '900', letterSpacing: 1, fontSize: 16 },
  tapHint: { color: '#ECFDF5', opacity: 0.9, marginTop: 4, fontSize: 12 },

  controls: {
    marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  ctrlBtn: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#0C1322',
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyText: { color: COLORS.sub },

  section: { marginTop: 8 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  emptyList: { alignItems: 'center', paddingVertical: 24 },
  emptySubtle: { color: COLORS.sub, fontWeight: '600' },
  emptyHelp: { color: COLORS.sub, marginTop: 4 },

  routineCard: {
    backgroundColor: COLORS.softCard,
    borderRadius: RADIUS, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  routineName: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  routineMeta: { color: COLORS.sub, marginTop: 2 },
  routineActions: { flexDirection: 'row', gap: 8 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  textBtn: { padding: 8 },
  textPressed: { opacity: 0.7 },
  cancel: { color: COLORS.sub, fontWeight: '700' },
  save: { color: COLORS.accent, fontWeight: '800' },

  modalBody: { padding: 16 },
  label: { color: COLORS.text, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#0C1322', borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.text, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 14,
  },

  filtersRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0C1322', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  searchInput: { flex: 1, color: COLORS.text, paddingVertical: 0 },
  clearBtn: { padding: 4, borderRadius: 8, backgroundColor: '#0B253016' },

  filterIcon: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#0C1322', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 10, paddingVertical: 10,
  },
  filterText: { color: COLORS.sub, fontWeight: '700' },

  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginRight: 8, borderWidth: 1 },
  chipIdle: {},
  chipIdleBg: {},
  chipIdleBorder: {},
  chipTextIdle: { color: COLORS.sub, fontWeight: '700' },
  chipActive: { backgroundColor: COLORS.chipActiveBg, borderColor: '#064E3B' },
  chipIdleBg2: { backgroundColor: COLORS.chipIdleBg, borderColor: COLORS.border },
  chipTextActive: { color: '#ECFDF5', fontWeight: '800' },

  sectionHeader: {
    backgroundColor: '#0C1322', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 10, marginTop: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sectionHeaderText: { color: COLORS.sub, fontWeight: '800', textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.7 },

  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.softCard, borderRadius: 14, padding: 12, marginTop: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  optionActive: { borderColor: COLORS.accent, backgroundColor: '#0D1C24' },
  checkBox: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkBoxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  optArabic: { color: COLORS.text, fontWeight: '800', fontSize: 16, marginBottom: 4 },
  optTranslit: { color: COLORS.accent, fontWeight: '700' },
  optTranslation: { color: COLORS.sub, fontStyle: 'italic', marginTop: 4 },

  countRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  countLabel: { color: COLORS.sub, width: 60 },
  countStepper: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: '#0C1322',
  },
  stepBtn: {
    width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0B253016',
  },
  stepText: { color: COLORS.text, fontSize: 18, fontWeight: '900', lineHeight: 20 },
  countInput: {
    minWidth: 52, textAlign: 'center', color: COLORS.text, paddingVertical: 4,
  },
});
