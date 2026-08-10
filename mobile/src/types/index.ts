export interface ExerciseItem {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
  rest?: number;
  isBodyweight?: boolean;
}

export interface Workout {
  id: number | string;
  type: string; // 'push', 'pull', 'legs', 'upper', 'lower', 'whole', 'warmup', 'cooldown', 'rest', or custom id
  date: string; // ISO String
  exercises?: ExerciseItem[];
  isRestDay?: boolean;
}

export interface Template {
  id?: string;
  name: string;
  category: string;
  exercises: ExerciseItem[];
}

export interface CustomWorkoutType {
  id: string;
  name: string;
  color: string;
  exercises: ExerciseItem[];
}

export interface WeightLog {
  id: number | string;
  date: string; // YYYY-MM-DD or ISO
  weight: number;
}

export interface HistoricalExerciseRecord extends ExerciseItem {
  workoutId: number | string;
  workoutType: string;
  exerciseIdx: number;
  date: Date;
}

export type RootTabParamList = {
  Programs: undefined;
  Calendar: undefined;
  Stats: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  WorkoutLogger: {
    workoutType: string;
    date?: string;
    templateData?: Template;
    existingWorkoutId?: number | string;
  };
};
