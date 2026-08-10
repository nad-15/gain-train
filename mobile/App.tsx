import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <WorkoutProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </WorkoutProvider>
    </SafeAreaProvider>
  );
}
