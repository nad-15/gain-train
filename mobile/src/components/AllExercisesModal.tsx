import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { calculatePersonalBest, getAllExerciseData } from '../services/workoutUtils';
import { useWorkout } from '../context/WorkoutContext';

interface AllExercisesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseName: string) => void;
}

export const AllExercisesModal: React.FC<AllExercisesModalProps> = ({
  visible,
  onClose,
  onSelectExercise,
}) => {
  const { workouts } = useWorkout();

  // Extract unique exercise names
  const uniqueNames = Array.from(
    new Set(
      workouts.flatMap((w) => (w.exercises ? w.exercises.map((e) => e.name) : []))
    )
  ).sort();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>All Exercises ({uniqueNames.length})</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.grid}>
            {uniqueNames.map((name) => {
              const records = getAllExerciseData(workouts, name);
              const pb = calculatePersonalBest(workouts, name);

              return (
                <TouchableOpacity
                  key={name}
                  style={styles.card}
                  onPress={() => {
                    onClose();
                    onSelectExercise(name);
                  }}
                >
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.subText}>{records.length} session(s) logged</Text>
                  <View style={styles.pbBadge}>
                    <MaterialCommunityIcons name="star" size={14} color="#d4a017" />
                    <Text style={styles.pbText}>PR: {pb.maxWeight} kg</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 8,
  },
  pbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbe6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pbText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d4a017',
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.background,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textMuted,
  },
});
