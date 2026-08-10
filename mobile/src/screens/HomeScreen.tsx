import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Template } from '../types';
import { WORKOUT_COLORS, theme } from '../theme/colors';
import { useWorkout } from '../context/WorkoutContext';
import { TemplateSelectorModal } from '../components/TemplateSelectorModal';
import { CustomWorkoutModal } from '../components/CustomWorkoutModal';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { customWorkoutTypes, addWorkout } = useWorkout();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  const handleSelectProgram = (type: string) => {
    setSelectedType(type);
  };

  const handleTemplateChosen = (template: Template | null) => {
    if (!selectedType) return;
    navigation.navigate('WorkoutLogger', {
      workoutType: selectedType,
      templateData: template || undefined,
    });
    setSelectedType(null);
  };

  const handleMarkRest = async () => {
    const restWorkout = {
      id: Date.now(),
      type: 'rest',
      date: new Date().toISOString(),
      isRestDay: true,
      exercises: [],
    };
    await addWorkout(restWorkout);
    alert('Rest Day logged for today!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏋️‍♂️ Be better today!</Text>
          <Text style={styles.subtitle}>Progressive Overload Made Simple</Text>
        </View>

        {/* Section 1: Preparation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>Preparation</Text>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.card, { borderColor: WORKOUT_COLORS.warmup }]}
              onPress={() => handleSelectProgram('warmup')}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={32} color={WORKOUT_COLORS.warmup} />
              <Text style={styles.cardLabel}>Warm-up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { borderColor: WORKOUT_COLORS.cooldown }]}
              onPress={() => handleSelectProgram('cooldown')}
            >
              <MaterialCommunityIcons name="leaf" size={32} color={WORKOUT_COLORS.cooldown} />
              <Text style={styles.cardLabel}>Cool-down</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Training Programs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="dumbbell" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>Training Programs</Text>
          </View>

          <View style={styles.grid}>
            {[
              { id: 'push', name: 'Push', color: WORKOUT_COLORS.push },
              { id: 'pull', name: 'Pull', color: WORKOUT_COLORS.pull },
              { id: 'legs', name: 'Legs', color: WORKOUT_COLORS.legs },
              { id: 'upper', name: 'Upper', color: WORKOUT_COLORS.upper },
              { id: 'lower', name: 'Lower', color: WORKOUT_COLORS.lower },
              { id: 'whole', name: 'Full Body', color: WORKOUT_COLORS.whole },
            ].map((program) => (
              <TouchableOpacity
                key={program.id}
                style={[styles.card, { borderColor: program.color }]}
                onPress={() => handleSelectProgram(program.id)}
              >
                <View style={[styles.badgeBar, { backgroundColor: program.color }]} />
                <MaterialCommunityIcons name="run-fast" size={28} color={program.color} />
                <Text style={styles.cardLabel}>{program.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 3: Custom Programs */}
        {customWorkoutTypes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="tune" size={20} color={theme.primary} />
              <Text style={styles.sectionTitle}>Custom Programs</Text>
            </View>

            <View style={styles.grid}>
              {customWorkoutTypes.map((custom) => (
                <TouchableOpacity
                  key={custom.id}
                  style={[styles.card, { borderColor: custom.color }]}
                  onPress={() => handleSelectProgram(custom.id)}
                >
                  <View style={[styles.badgeBar, { backgroundColor: custom.color }]} />
                  <MaterialCommunityIcons name="star-outline" size={28} color={custom.color} />
                  <Text style={styles.cardLabel}>{custom.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.restBtn} onPress={handleMarkRest}>
            <MaterialCommunityIcons name="bed" size={20} color={theme.textMuted} />
            <Text style={styles.restBtnText}>Rest Day</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.customBtn} onPress={() => setShowCustomModal(true)}>
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color={theme.primary} />
            <Text style={styles.customBtnText}>Create Custom</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      {selectedType && (
        <TemplateSelectorModal
          visible={!!selectedType}
          workoutType={selectedType}
          onClose={() => setSelectedType(null)}
          onSelectTemplate={handleTemplateChosen}
        />
      )}

      <CustomWorkoutModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  badgeBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  restBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  restBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textMuted,
  },
  customBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#edf2ff',
    borderWidth: 1,
    borderColor: '#dbe4ff',
  },
  customBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.primary,
  },
});
