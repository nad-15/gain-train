import { Workout, ExerciseItem, HistoricalExerciseRecord } from '../types';

export const DEFAULT_TEMPLATES: Record<string, string[]> = {
  push: ['Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Tricep Dips'],
  pull: ['Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Bicep Curls'],
  legs: ['Squats', 'Deadlift', 'Leg Press', 'Leg Curls'],
  upper: ['Bench Press', 'Pull-ups', 'Overhead Press', 'Barbell Row'],
  lower: ['Squats', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'],
  whole: ['Squats', 'Bench Press', 'Deadlift', 'Pull-ups', 'Overhead Press'],
};

export function getAllExerciseData(
  workouts: Workout[],
  exerciseName: string
): HistoricalExerciseRecord[] {
  if (!exerciseName || exerciseName.trim() === '') return [];

  const results: HistoricalExerciseRecord[] = [];

  workouts.forEach((w) => {
    if (w.exercises) {
      w.exercises.forEach((ex, idx) => {
        if (ex.name && ex.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()) {
          results.push({
            ...ex,
            workoutId: w.id,
            workoutType: w.type,
            exerciseIdx: idx,
            date: new Date(w.date),
          });
        }
      });
    }
  });

  return results.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getLastExerciseData(
  workouts: Workout[],
  exerciseName: string
): HistoricalExerciseRecord | null {
  const records = getAllExerciseData(workouts, exerciseName);
  return records.length > 0 ? records[0] : null;
}

export function calculatePersonalBest(
  workouts: Workout[],
  exerciseName: string
): { maxWeight: number; maxVolume: number } {
  const records = getAllExerciseData(workouts, exerciseName);
  let maxWeight = 0;
  let maxVolume = 0;

  records.forEach((rec) => {
    if (rec.weight > maxWeight) maxWeight = rec.weight;
    const vol = rec.sets * rec.reps * rec.weight;
    if (vol > maxVolume) maxVolume = vol;
  });

  return { maxWeight, maxVolume };
}

export function calculateVolume(ex: ExerciseItem): number {
  return (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
}

export function compareExerciseVolume(
  currentEx: ExerciseItem,
  prevEx: ExerciseItem | null
): { status: 'increased' | 'decreased' | 'same' | 'none'; diff: number } {
  if (!prevEx) return { status: 'none', diff: 0 };
  const currentVol = calculateVolume(currentEx);
  const prevVol = calculateVolume(prevEx);

  if (prevVol === 0) return { status: 'none', diff: 0 };

  const diff = currentVol - prevVol;
  if (diff > 0) return { status: 'increased', diff };
  if (diff < 0) return { status: 'decreased', diff: Math.abs(diff) };
  return { status: 'same', diff: 0 };
}
