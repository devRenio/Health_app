import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CalendarScreen from '../screens/CalendarScreen';
import DayDetailScreen from '../screens/DayDetailScreen';
import WorkoutEditorScreen from '../screens/WorkoutEditorScreen';
import {COLORS} from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: COLORS.beige},
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="DayDetail" component={DayDetailScreen} />
        <Stack.Screen name="WorkoutEditor" component={WorkoutEditorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
