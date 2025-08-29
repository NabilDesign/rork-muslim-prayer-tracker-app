import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const chartWidth = width - 80;

interface WeeklyChartProps {
  data: Array<{
    day: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const maxHeight = 120;

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((item, index) => {
          const barHeight = (item.percentage / 100) * maxHeight;
          const color = item.percentage >= 80 ? '#10B981' : 
                       item.percentage >= 60 ? '#F59E0B' : 
                       item.percentage >= 40 ? '#EF4444' : '#9CA3AF';
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: color,
                    },
                  ]}
                />
                <View style={[styles.barBackground, { height: maxHeight }]} />
              </View>
              <Text style={styles.dayLabel}>{item.day}</Text>
              <Text style={styles.valueLabel}>
                {item.completed}/{item.total}
              </Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Excellent (80%+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Good (60-79%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Needs Work (40-59%)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 120,
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
    zIndex: 2,
  },
  barBackground: {
    width: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  valueLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});