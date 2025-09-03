import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings as SettingsIcon,
  Bell,
  Clock,
  Trash2,
  Info,
  Heart,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { useAppStore } from '@/src/store/app-store';
import { notificationManager, getFrequencyText } from '@/src/logic/notifications';

export default function SettingsScreen() {
  const { settings, updateSettings, clearAllData } = useAppStore();
  const [remindersEnabled, setRemindersEnabled] = useState(settings.notificationsEnabled);
  const [reminderMinutes, setReminderMinutes] = useState(settings.reminderMinutes);
  const [notificationStatus, setNotificationStatus] = useState<'checking' | 'granted' | 'denied'>('checking');

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const hasPermission = await notificationManager.requestPermissions();
    setNotificationStatus(hasPermission ? 'granted' : 'denied');
  };

  const handleReminderToggle = async (value: boolean) => {
    setRemindersEnabled(value);
    updateSettings({ notificationsEnabled: value });
    
    // Schedule or cancel notifications
    await notificationManager.scheduleReminders({
      enabled: value,
      frequency: reminderMinutes,
    });
    
    // Recheck notification status
    await checkNotificationStatus();
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your progress and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon: Icon, title, subtitle, children, onPress }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon color="#2D5016" size={20} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <SettingsIcon color="#FFFFFF" size={32} />
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </View>
        <View style={styles.headerDecoration}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          
          <SettingItem
            icon={Bell}
            title="Daily Reminders"
            subtitle="Get reminded for daily reflections"
          >
            <Switch
              value={remindersEnabled}
              onValueChange={handleReminderToggle}
              trackColor={{ false: '#E5E7EB', true: '#BBF7D0' }}
              thumbColor={remindersEnabled ? '#2D5016' : '#9CA3AF'}
            />
          </SettingItem>

          <SettingItem
            icon={notificationStatus === 'granted' ? CheckCircle : XCircle}
            title="Notification Status"
            subtitle={notificationStatus === 'checking' ? 'Checking permissions...' : 
                     notificationStatus === 'granted' ? 'Notifications enabled' : 
                     'Notifications disabled - tap to enable'}
            onPress={notificationStatus === 'denied' ? checkNotificationStatus : undefined}
          />

          <SettingItem
            icon={Clock}
            title="Reminder Frequency"
            subtitle={`${getFrequencyText(reminderMinutes)}`}
            onPress={() => {
              Alert.alert(
                'Reminder Frequency',
                'Choose how often you want to be reminded for reflections',
                [
                  { text: '2 times a day', onPress: async () => {
                    setReminderMinutes(720); // 12 hours
                    updateSettings({ reminderMinutes: 720 });
                    if (remindersEnabled) {
                      await notificationManager.scheduleReminders({
                        enabled: true,
                        frequency: 720,
                      });
                    }
                  }},
                  { text: 'Once a day', onPress: async () => {
                    setReminderMinutes(1440); // 24 hours
                    updateSettings({ reminderMinutes: 1440 });
                    if (remindersEnabled) {
                      await notificationManager.scheduleReminders({
                        enabled: true,
                        frequency: 1440,
                      });
                    }
                  }},
                  { text: 'Every 6 hours', onPress: async () => {
                    setReminderMinutes(360);
                    updateSettings({ reminderMinutes: 360 });
                    if (remindersEnabled) {
                      await notificationManager.scheduleReminders({
                        enabled: true,
                        frequency: 360,
                      });
                    }
                  }},
                  { text: 'Every 4 hours', onPress: async () => {
                    setReminderMinutes(240);
                    updateSettings({ reminderMinutes: 240 });
                    if (remindersEnabled) {
                      await notificationManager.scheduleReminders({
                        enabled: true,
                        frequency: 240,
                      });
                    }
                  }},
                  { text: 'Every 2 hours', onPress: async () => {
                    setReminderMinutes(120);
                    updateSettings({ reminderMinutes: 120 });
                    if (remindersEnabled) {
                      await notificationManager.scheduleReminders({
                        enabled: true,
                        frequency: 120,
                      });
                    }
                  }},
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <SettingItem
            icon={Trash2}
            title="Clear All Data"
            subtitle="Delete all reflections and settings"
            onPress={handleClearData}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingItem
            icon={Info}
            title="App Version"
            subtitle="1.3.0"
          />

          <SettingItem
            icon={Heart}
            title="Made with Love"
            subtitle="For the Muslim community"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "And establish prayer and give zakah and bow with those who bow."
          </Text>
          <Text style={styles.footerReference}>- Quran 2:43</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -10,
    right: 20,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 20,
    left: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#F8FAFC',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#1E293B',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    letterSpacing: -0.3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    marginBottom: 8,
  },
  footerReference: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600' as const,
  },
});