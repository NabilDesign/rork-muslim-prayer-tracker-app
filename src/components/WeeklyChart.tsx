import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WeeklyChartProps {
  // Simplified props
}

export const WeeklyChart: React.FC<WeeklyChartProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Progress</Text>
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>Chart coming soon</Text>
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
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});