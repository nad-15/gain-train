import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ExerciseItem } from '../types';
import { WORKOUT_COLORS, theme } from '../theme/colors';
import { DEFAULT_TEMPLATES } from '../services/workoutUtils';
import { useWorkout } from '../context/WorkoutContext';
import { ExerciseCard } from '../components/ExerciseCard';
import { AddExerciseModal } from '../components/AddExerciseModal';
import { SaveTemplateModal } from '../components/SaveTemplateModal';
import { ExerciseHistoryModal } from '../components/ExerciseHistoryModal';

type WorkoutScreenProps = NativeStackScreenProps<RootStackParamList, 'WorkoutLogger'>;

export const WorkoutScreen: React.FC<WorkoutScreenProps> = ({ route, navigation }) => {
  const { workoutType, templateData, date, existingWorkoutId } = route.params;
  const { workouts, customWorkoutTypes, addWorkout, updateWorkout } = useWorkout();

  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState<boolean>(false);
  const [historyTargetExercise, setHistoryTargetExercise] = useState<string | null>(null);

  const getDisplayName = () => {
    const custom = customWorkoutTypes.find((c) => c.id === workoutType);
    if (custom) return custom.name;
    if (workoutType === 'warmup') return 'Warm-up';
    if (workoutType === 'cooldown') return 'Cool-down';
    return workoutType.charAt(0).toUpperCase() + workoutType.slice(1);
  };

  const getBadgeColor = () => {
    const custom = customWorkoutTypes.find((c) => c.id === workoutType);
    if (custom) return custom.color;
    return WORKOUT_COLORS[workoutType] || theme.primary;
  };

  useEffect(() => {
    if (existingWorkoutId) {
      const existing = workouts.find((w) => w.id === existingWorkoutId);
      if (existing && existing.exercises) {
        setExercises(existing.exercises);
        return;
      }
    }

    if (templateData && templateData.exercises) {
      setExercises(JSON.parse(JSON.stringify(templateData.exercises)));
    } else {
      const custom = customWorkoutTypes.find((c) => c.id === workoutType);
      if (custom && custom.exercises) {
        setExercises(JSON.parse(JSON.stringify(custom.exercises)));
      } else if (DEFAULT_TEMPLATES[workoutType]) {
        const defaults = DEFAULT_TEMPLATES[workoutType].map((name) => ({
          name,
          sets: 3,
          reps: 10,
          weight: 0,
          notes: '',
          rest: 60,
        }));
        setExercises(defaults);
      } else {
        setExercises([]);
      }
    }
  }, [existingWorkoutId, templateData, workoutType]);

  const handleUpdateExercise = (index: number, updated: ExerciseItem) => {
    const copy = [...exercises];
    copy[index] = updated;
    setExercises(copy);
  };

  const handleDeleteExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleAddExercise = (newEx: ExerciseItem) => {
    setExercises([...exercises, newEx]);
  };

  const handleFinishWorkout = async () => {
    const targetDate = date ? date : new Date().toISOString();
    const workoutPayload = {
      id: existingWorkoutId ? existingWorkoutId : Date.now(),
      type: workoutType,
      date: targetDate,
      exercises,
    };

    if (existingWorkoutId) {
      await updateWorkout(workoutPayload);
    } else {
      await addWorkout(workoutPayload);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={[styles.colorDot, { backgroundColor: getBadgeColor() }]} />
          <Text style={styles.headerTitle}>{getDisplayName()} Workout</Text>
        </View>

        <TouchableOpacity style={styles.finishBtn} onPress={handleFinishWorkout}>
          <Text style={styles.finishBtnText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.dateLabel}>
          {new Date(date ? date : Date.now()).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {exercises.map((ex, index) => (
          <ExerciseCard
            key={ex.name + '_' + index}
            exercise={ex}
            index={index}
            onUpdate={(updated) => handleUpdateExercise(index, updated)}
            onDelete={() => handleDeleteExercise(index)}
            onOpenHistory={() => setHistoryTargetExercise(ex.name)}
          />
        ))}

        <TouchableOpacity style={styles.addExerciseBtn} onPress={() => setShowAddModal(true)}>
          <MaterialCommunityIcons name="plus" size={20} color={theme.primary} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        {exercises.length > 0 && (
          <TouchableOpacity
            style={styles.saveTemplateBtn}
            onPress={() => setShowSaveTemplateModal(true)}
          >
            <MaterialCommunityIcons name="bookmark-outline" size={20} color={theme.textMuted} />
            <Text style={styles.saveTemplateText}>Save as Template</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modals */}
      <AddExerciseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddExercise}
      />

      <SaveTemplateModal
        visible={showSaveTemplateModal}
        category={workoutType}
        exercises={exercises}
        onClose={() => setShowSaveTemplateModal(false)}
      />

      {historyTargetExercise && (
        <ExerciseHistoryModal
          visible={!!historyTargetExercise}
          exerciseName={historyTargetExercise}
          onClose={() => setHistoryTargetExercise(null)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  finishBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  finishBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  dateLabel: {
    fontSize: 14,
    color: theme.textMuted,
    marginBottom: 16,
    fontWeight: '500',
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.primary,
    backgroundColor: '#ebffed',
    marginBottom: 12,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primary,
  },
  saveTemplateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  saveTemplateText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
});
