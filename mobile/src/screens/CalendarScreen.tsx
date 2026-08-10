import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { WORKOUT_COLORS, theme } from '../theme/colors';
import { useWorkout } from '../context/WorkoutContext';
import { CalendarView } from '../components/CalendarView';
import { RescheduleModal } from '../components/RescheduleModal';
import { TemplateSelectorModal } from '../components/TemplateSelectorModal';

type CalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CalendarScreenProps {
  navigation: CalendarScreenNavigationProp;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { workouts, customWorkoutTypes, weightLogs, deleteWorkout, addWeightLog } = useWorkout();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showReschedule, setShowReschedule] = useState<boolean>(false);
  const [showWeightInput, setShowWeightInput] = useState<boolean>(false);
  const [weightInputVal, setWeightInputVal] = useState<string>('');
  const [selectedTypeForDate, setSelectedTypeForDate] = useState<string | null>(null);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const loggedWorkout = workouts.find(
    (w) => format(new Date(w.date), 'yyyy-MM-dd') === selectedDateStr
  );
  const loggedWeight = weightLogs.find(
    (wl) => format(new Date(wl.date), 'yyyy-MM-dd') === selectedDateStr
  );

  const getBadgeColor = (type: string) => {
    const custom = customWorkoutTypes.find((c) => c.id === type);
    if (custom) return custom.color;
    return WORKOUT_COLORS[type] || theme.primary;
  };

  const handleSaveWeight = async () => {
    const val = parseFloat(weightInputVal);
    if (!isNaN(val) && val > 0) {
      await addWeightLog(selectedDate.toISOString(), val);
    }
    setShowWeightInput(false);
    setWeightInputVal('');
  };

  const handleStartWorkoutForDate = (template: any) => {
    if (!selectedTypeForDate) return;
    navigation.navigate('WorkoutLogger', {
      workoutType: selectedTypeForDate,
      date: selectedDate.toISOString(),
      templateData: template || undefined,
    });
    setSelectedTypeForDate(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <CalendarView selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Selected Date Details Drawer */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsDateLabel}>
              {format(selectedDate, 'EEEE, MMM d, yyyy')}
            </Text>

            {loggedWeight && (
              <View style={styles.weightPill}>
                <MaterialCommunityIcons name="scale-bathroom" size={14} color="#e8590c" />
                <Text style={styles.weightText}>{loggedWeight.weight} kg</Text>
              </View>
            )}

            {/* Action Tools */}
            <View style={styles.toolsRow}>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => setShowWeightInput(!showWeightInput)}
              >
                <MaterialCommunityIcons name="scale-bathroom" size={20} color={theme.primary} />
              </TouchableOpacity>

              {loggedWorkout && (
                <>
                  <TouchableOpacity
                    style={styles.toolBtn}
                    onPress={() => setShowReschedule(true)}
                  >
                    <MaterialCommunityIcons name="calendar-sync" size={20} color={theme.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toolBtn}
                    onPress={() => deleteWorkout(loggedWorkout.id)}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.danger} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Weight log inline input */}
          {showWeightInput && (
            <View style={styles.weightInputRow}>
              <TextInput
                style={styles.weightInput}
                placeholder="Log weight (kg)"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={weightInputVal}
                onChangeText={setWeightInputVal}
              />
              <TouchableOpacity style={styles.saveWeightBtn} onPress={handleSaveWeight}>
                <Text style={styles.saveWeightText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Logged Workout Content */}
          {loggedWorkout ? (
            <View style={styles.workoutSummary}>
              <View style={styles.workoutBadgeRow}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getBadgeColor(loggedWorkout.type) },
                  ]}
                >
                  <Text style={styles.badgeText}>{loggedWorkout.type.toUpperCase()}</Text>
                </View>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    navigation.navigate('WorkoutLogger', {
                      workoutType: loggedWorkout.type,
                      existingWorkoutId: loggedWorkout.id,
                      date: loggedWorkout.date,
                    })
                  }
                >
                  <MaterialCommunityIcons name="pencil" size={16} color={theme.primary} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {loggedWorkout.isRestDay ? (
                <Text style={styles.restDayText}>🛌 Rest Day Logged</Text>
              ) : (
                loggedWorkout.exercises?.map((ex, i) => (
                  <View key={i} style={styles.exerciseRow}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {ex.sets} sets × {ex.reps} reps @{' '}
                      {ex.isBodyweight ? 'BW' : `${ex.weight} kg`}
                    </Text>
                  </View>
                ))
              )}
            </View>
          ) : (
            <View style={styles.noWorkoutContainer}>
              <Text style={styles.noWorkoutText}>No workout logged for this day.</Text>
              <TouchableOpacity
                style={styles.logWorkoutBtn}
                onPress={() => setSelectedTypeForDate('push')}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                <Text style={styles.logWorkoutBtnText}>Log Workout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      {loggedWorkout && (
        <RescheduleModal
          visible={showReschedule}
          workoutId={loggedWorkout.id}
          currentDate={loggedWorkout.date}
          onClose={() => setShowReschedule(false)}
        />
      )}

      {selectedTypeForDate && (
        <TemplateSelectorModal
          visible={!!selectedTypeForDate}
          workoutType={selectedTypeForDate}
          onClose={() => setSelectedTypeForDate(null)}
          onSelectTemplate={handleStartWorkoutForDate}
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
  detailsCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailsDateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  weightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff4e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weightText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e8590c',
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toolBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.background,
  },
  weightInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  weightInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.text,
  },
  saveWeightBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveWeightText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  workoutSummary: {
    marginTop: 8,
  },
  workoutBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    color: theme.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  restDayText: {
    fontSize: 16,
    color: theme.textMuted,
    marginVertical: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  exerciseMeta: {
    fontSize: 13,
    color: theme.textMuted,
  },
  noWorkoutContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noWorkoutText: {
    fontSize: 14,
    color: theme.textMuted,
    marginBottom: 12,
  },
  logWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logWorkoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
