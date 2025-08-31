import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  frequency: number; // in minutes
}

class NotificationManager {
  private static instance: NotificationManager;
  private notificationIds: string[] = [];

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleReminders(settings: NotificationSettings): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return;
    }

    try {
      // Cancel existing notifications
      await this.cancelAllReminders();

      if (!settings.enabled) {
        return;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return;
      }

      // Schedule recurring reminders
      const reminderMessages = [
        'Time for dhikr! Remember Allah and find peace.',
        'Take a moment to remember Allah through dhikr.',
        'Your spiritual journey awaits. Start your dhikr routine.',
        'Connect with Allah through beautiful dhikr.',
        'A few minutes of dhikr can bring tranquility to your day.',
      ];

      // Schedule recurring notifications using interval trigger
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Dhikr Reminder',
          body: reminderMessages[Math.floor(Math.random() * reminderMessages.length)],
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: settings.frequency * 60,
          repeats: true,
        },
      });

      this.notificationIds.push(notificationId);

      console.log(`Scheduled dhikr reminder every ${settings.frequency} minutes`);
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }

  async cancelAllReminders(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      // Cancel all scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationIds = [];
      console.log('All reminders cancelled');
    } catch (error) {
      console.error('Error cancelling reminders:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}

export const notificationManager = NotificationManager.getInstance();

// Helper function to format frequency text
export const getFrequencyText = (minutes: number): string => {
  switch (minutes) {
    case 720:
      return '2 times a day';
    case 1440:
      return 'Once a day';
    case 360:
      return 'Every 6 hours';
    case 240:
      return 'Every 4 hours';
    case 120:
      return 'Every 2 hours';
    case 60:
      return 'Every hour';
    case 30:
      return 'Every 30 minutes';
    default:
      return `Every ${minutes} minutes`;
  }
};