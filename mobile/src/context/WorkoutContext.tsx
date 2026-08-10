import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workout, Template, CustomWorkoutType, WeightLog } from '../types';
import { storageService } from '../services/storage';

interface WorkoutContextType {
  workouts: Workout[];
  templates: Record<string, Template[]>;
  customWorkoutTypes: CustomWorkoutType[];
  weightLogs: WeightLog[];
  calendarTextMode: boolean;
  graphType: 'workouts' | 'weight';
  isLoading: boolean;
  addWorkout: (workout: Workout) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (id: number | string) => Promise<void>;
  rescheduleWorkout: (id: number | string, newDateISO: string) => Promise<void>;
  addWeightLog: (date: string, weight: number) => Promise<void>;
  deleteWeightLog: (id: number | string) => Promise<void>;
  addCustomWorkoutType: (type: CustomWorkoutType) => Promise<void>;
  deleteCustomWorkoutType: (id: string) => Promise<void>;
  addTemplate: (template: Template) => Promise<void>;
  deleteTemplate: (category: string, templateName: string) => Promise<void>;
  toggleCalendarTextMode: () => Promise<void>;
  setGraphType: (type: 'workouts' | 'weight') => Promise<void>;
  mergeExerciseNames: (sourceName: string, targetName: string) => Promise<void>;
  reloadAll: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<Record<string, Template[]>>({});
  const [customWorkoutTypes, setCustomWorkoutTypes] = useState<CustomWorkoutType[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [calendarTextMode, setCalendarTextModeState] = useState<boolean>(false);
  const [graphType, setGraphTypeState] = useState<'workouts' | 'weight'>('workouts');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const reloadAll = async () => {
    setIsLoading(true);
    const [w, t, c, wl, tm, gt] = await Promise.all([
      storageService.getWorkouts(),
      storageService.getTemplates(),
      storageService.getCustomWorkoutTypes(),
      storageService.getWeightLogs(),
      storageService.getCalendarTextMode(),
      storageService.getGraphType(),
    ]);
    setWorkouts(w);
    setTemplates(t);
    setCustomWorkoutTypes(c);
    setWeightLogs(wl);
    setCalendarTextModeState(tm);
    setGraphTypeState(gt);
    setIsLoading(false);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const addWorkout = async (workout: Workout) => {
    const updated = [workout, ...workouts.filter((w) => w.id !== workout.id)];
    setWorkouts(updated);
    await storageService.saveWorkouts(updated);
  };

  const updateWorkout = async (workout: Workout) => {
    const updated = workouts.map((w) => (w.id === workout.id ? workout : w));
    setWorkouts(updated);
    await storageService.saveWorkouts(updated);
  };

  const deleteWorkout = async (id: number | string) => {
    const updated = workouts.filter((w) => w.id !== id);
    setWorkouts(updated);
    await storageService.saveWorkouts(updated);
  };

  const rescheduleWorkout = async (id: number | string, newDateISO: string) => {
    const updated = workouts.map((w) => (w.id === id ? { ...w, date: newDateISO } : w));
    setWorkouts(updated);
    await storageService.saveWorkouts(updated);
  };

  const addWeightLog = async (date: string, weight: number) => {
    const existingIndex = weightLogs.findIndex((wl) => wl.date === date);
    let updated: WeightLog[];
    if (existingIndex >= 0) {
      updated = [...weightLogs];
      updated[existingIndex] = { ...updated[existingIndex], weight };
    } else {
      updated = [{ id: Date.now(), date, weight }, ...weightLogs];
    }
    setWeightLogs(updated);
    await storageService.saveWeightLogs(updated);
  };

  const deleteWeightLog = async (id: number | string) => {
    const updated = weightLogs.filter((wl) => wl.id !== id);
    setWeightLogs(updated);
    await storageService.saveWeightLogs(updated);
  };

  const addCustomWorkoutType = async (type: CustomWorkoutType) => {
    const updated = [...customWorkoutTypes.filter((c) => c.id !== type.id), type];
    setCustomWorkoutTypes(updated);
    await storageService.saveCustomWorkoutTypes(updated);
  };

  const deleteCustomWorkoutType = async (id: string) => {
    const updated = customWorkoutTypes.filter((c) => c.id !== id);
    setCustomWorkoutTypes(updated);
    await storageService.saveCustomWorkoutTypes(updated);
  };

  const addTemplate = async (template: Template) => {
    const category = template.category;
    const catList = templates[category] || [];
    const updatedCatList = [
      template,
      ...catList.filter((t) => t.name.toLowerCase() !== template.name.toLowerCase()),
    ];
    const updatedTemplates = { ...templates, [category]: updatedCatList };
    setTemplates(updatedTemplates);
    await storageService.saveTemplates(updatedTemplates);
  };

  const deleteTemplate = async (category: string, templateName: string) => {
    const catList = templates[category] || [];
    const updatedCatList = catList.filter((t) => t.name !== templateName);
    const updatedTemplates = { ...templates, [category]: updatedCatList };
    setTemplates(updatedTemplates);
    await storageService.saveTemplates(updatedTemplates);
  };

  const toggleCalendarTextMode = async () => {
    const nextVal = !calendarTextMode;
    setCalendarTextModeState(nextVal);
    await storageService.setCalendarTextMode(nextVal);
  };

  const setGraphType = async (type: 'workouts' | 'weight') => {
    setGraphTypeState(type);
    await storageService.setGraphType(type);
  };

  const mergeExerciseNames = async (sourceName: string, targetName: string) => {
    const updated = workouts.map((w) => {
      if (!w.exercises) return w;
      const updatedExercises = w.exercises.map((ex) => {
        if (ex.name.trim().toLowerCase() === sourceName.trim().toLowerCase()) {
          return { ...ex, name: targetName };
        }
        return ex;
      });
      return { ...w, exercises: updatedExercises };
    });
    setWorkouts(updated);
    await storageService.saveWorkouts(updated);
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        templates,
        customWorkoutTypes,
        weightLogs,
        calendarTextMode,
        graphType,
        isLoading,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        rescheduleWorkout,
        addWeightLog,
        deleteWeightLog,
        addCustomWorkoutType,
        deleteCustomWorkoutType,
        addTemplate,
        deleteTemplate,
        toggleCalendarTextMode,
        setGraphType,
        mergeExerciseNames,
        reloadAll,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
