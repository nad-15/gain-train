import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { theme } from '../theme/colors';
import { getAllExerciseData, calculateVolume } from '../services/workoutUtils';
import { useWorkout } from '../context/WorkoutContext';
import { AllExercisesModal } from '../components/AllExercisesModal';
import { ExerciseHistoryModal } from '../components/ExerciseHistoryModal';

export const StatsScreen: React.FC = () => {
  const { workouts, weightLogs, graphType, setGraphType } = useWorkout();
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [showAllModal, setShowAllModal] = useState<boolean>(false);
  const [historyTarget, setHistoryTarget] = useState<string | null>(null);

  // Extract unique exercise names
  const uniqueExerciseNames = Array.from(
    new Set(
      workouts.flatMap((w) => (w.exercises ? w.exercises.map((e) => e.name) : []))
    )
  ).sort();

  // Weekly workouts bar chart data (last 8 weeks)
  const getWeeklyWorkoutsData = () => {
    const data = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i));
      const weekEnd = endOfWeek(weekStart);
      const count = workouts.filter((w) => {
        const d = new Date(w.date);
        return d >= weekStart && d <= weekEnd;
      }).length;

      data.push({
        value: count,
        label: format(weekStart, 'MMM d'),
        frontColor: theme.primary,
      });
    }
    return data;
  };

  // Weight line chart data
  const getWeightChartData = () => {
    const sorted = [...weightLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (sorted.length === 0) return [{ value: 70, label: 'Today' }];
    return sorted.map((wl) => ({
      value: wl.weight,
      label: format(new Date(wl.date), 'MMM d'),
      dataPointText: `${wl.weight}`,
    }));
  };

  // Exercise volume trend data
  const getExerciseVolumeData = () => {
    if (!selectedExercise) return [];
    const records = getAllExerciseData(workouts, selectedExercise).reverse();
    return records.map((rec) => ({
      value: calculateVolume(rec),
      label: format(rec.date, 'MMM d'),
    }));
  };

  // Summary stats calculations
  const totalWorkouts = workouts.filter((w) => !w.isRestDay).length;
  const totalVolume = workouts.reduce((sum, w) => {
    if (!w.exercises) return sum;
    return sum + w.exercises.reduce((exSum, ex) => exSum + calculateVolume(ex), 0);
  }, 0);

  const workoutsData = getWeeklyWorkoutsData();
  const weightData = getWeightChartData();
  const volumeData = getExerciseVolumeData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Your Progress</Text>

        {/* Section 1: Weekly Progress / Weight Chart */}
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="chart-box" size={22} color={theme.primary} />
              <Text style={styles.cardTitle}>
                {graphType === 'workouts' ? 'Weekly Workouts' : 'Weight Trend'}
              </Text>
            </View>

            <View style={styles.toggleGroup}>
              <TouchableOpacity
                style={[styles.toggleBtn, graphType === 'workouts' && styles.toggleActive]}
                onPress={() => setGraphType('workouts')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    graphType === 'workouts' && styles.toggleTextActive,
                  ]}
                >
                  Workouts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, graphType === 'weight' && styles.toggleActive]}
                onPress={() => setGraphType('weight')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    graphType === 'weight' && styles.toggleTextActive,
                  ]}
                >
                  Weight
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.chartWrapper}>
            {graphType === 'workouts' ? (
              <BarChart
                data={workoutsData}
                barWidth={22}
                noOfSections={4}
                barBorderRadius={4}
                frontColor={theme.primary}
                yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 10 }}
                height={180}
              />
            ) : (
              <LineChart
                data={weightData}
                color={theme.primary}
                thickness={3}
                dataPointsColor={theme.primary}
                height={180}
                yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 10 }}
              />
            )}
          </View>
        </View>

        {/* Section 2: Exercise Volume Trend */}
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="trending-up" size={22} color={theme.success} />
              <Text style={styles.cardTitle}>Volume Trend</Text>
            </View>

            <TouchableOpacity
              style={styles.allBtn}
              onPress={() => setShowAllModal(true)}
            >
              <MaterialCommunityIcons name="grid" size={16} color={theme.primary} />
              <Text style={styles.allBtnText}>ALL</Text>
            </TouchableOpacity>
          </View>

          {/* Exercise Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipBar}>
            {uniqueExerciseNames.map((name) => (
              <TouchableOpacity
                key={name}
                style={[styles.chip, selectedExercise === name && styles.chipActive]}
                onPress={() => setSelectedExercise(name)}
              >
                <Text
                  style={[styles.chipText, selectedExercise === name && styles.chipTextActive]}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.chartWrapper}>
            {selectedExercise && volumeData.length > 0 ? (
              <LineChart
                data={volumeData}
                color={theme.success}
                thickness={3}
                dataPointsColor={theme.success}
                height={180}
                yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 10 }}
              />
            ) : (
              <Text style={styles.emptyChartText}>
                {selectedExercise
                  ? 'No volume history recorded for this exercise.'
                  : 'Select an exercise above to view volume progress.'}
              </Text>
            )}
          </View>

          {selectedExercise ? (
            <TouchableOpacity
              style={styles.historyTriggerBtn}
              onPress={() => setHistoryTarget(selectedExercise)}
            >
              <Text style={styles.historyTriggerText}>
                View Full {selectedExercise} History
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Section 3: Summary Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="trophy-outline" size={24} color="#d4a017" />
            <Text style={styles.statVal}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="weight-lifter" size={24} color={theme.primary} />
            <Text style={styles.statVal}>{Math.round(totalVolume)} kg</Text>
            <Text style={styles.statLabel}>Volume Lifted</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <AllExercisesModal
        visible={showAllModal}
        onClose={() => setShowAllModal(false)}
        onSelectExercise={(exName) => setSelectedExercise(exName)}
      />

      {historyTarget && (
        <ExerciseHistoryModal
          visible={!!historyTarget}
          exerciseName={historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: '#ebffed',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
  },
  toggleTextActive: {
    color: theme.primary,
    fontWeight: 'bold',
  },
  allBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#edf2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  allBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.primary,
  },
  chipBar: {
    flexGrow: 0,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#ebffed',
    borderColor: theme.success,
  },
  chipText: {
    fontSize: 13,
    color: theme.textMuted,
  },
  chipTextActive: {
    color: theme.success,
    fontWeight: 'bold',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 190,
  },
  emptyChartText: {
    fontSize: 13,
    color: theme.textMuted,
    textAlign: 'center',
  },
  historyTriggerBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  historyTriggerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  statVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
});
