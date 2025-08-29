import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stats } from '@/src/logic/stats';

interface WeeklyChartProps {
  stats: Stats;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ stats }) => {
  const maxValue = Math.max(...stats.weeklyData.map(d => d.completed), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Progress</Text>
      <View style={styles.chartContainer}>
        {stats.weeklyData.map((day, index) => (
          <View key={index} style={styles.dayContainer}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((day.completed / maxValue) * 60, 4),
                    backgroundColor: day.completed > 0 ? '#10B981' : '#E5E7EB',
                  },
                ]}
              />
            </View>
            <Text style={styles.dayLabel}>{day.day}</Text>
            <Text style={styles.dayValue}>{day.completed}</Text>
          </View>
        ))}
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {stats.thisWeekReflections} reflections this week
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginBottom: 16,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 60,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  dayValue: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  summary: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});