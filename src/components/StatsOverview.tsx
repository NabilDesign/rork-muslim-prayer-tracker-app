import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Target } from 'lucide-react-native';

interface StatsOverviewProps {
  streakDays: number;
  onTimeRate: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  streakDays,
  onTimeRate,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <View style={styles.statIcon}>
          <TrendingUp color="#10B981" size={16} />
        </View>
        <Text style={styles.statValue}>{streakDays}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
      
      <View style={styles.separator} />
      
      <View style={styles.statItem}>
        <View style={styles.statIcon}>
          <Target color="#3B82F6" size={16} />
        </View>
        <Text style={styles.statValue}>{Math.round(onTimeRate * 100)}%</Text>
        <Text style={styles.statLabel}>On Time</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  separator: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    marginHorizontal: 20,
  },
});