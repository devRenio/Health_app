/**
 * App.js — entry point with navigation + safe areas.
 */
import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {COLORS} from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.beige} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
