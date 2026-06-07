import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import CalendarScreen from '../screens/CalendarScreen';
import DayDetailScreen from '../screens/DayDetailScreen';
import WorkoutEditorScreen from '../screens/WorkoutEditorScreen';
import StatsScreen from '../screens/StatsScreen';
import {CalendarTabIcon, StatsTabIcon} from '../components/TabBarIcons';
import {COLORS} from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CalendarStack() {
  return (
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
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.beigeSoft,
            borderTopColor: COLORS.darkBrown,
            height: 56,
          },
          tabBarActiveTintColor: COLORS.indigo,
          tabBarInactiveTintColor: COLORS.brownMuted,
          tabBarLabelStyle: {fontSize: 12, fontWeight: '600'},
        }}>
        <Tab.Screen
          name="HomeTab"
          component={CalendarStack}
          options={{
            tabBarLabel: '캘린더',
            tabBarIcon: ({color, focused}) => (
              <CalendarTabIcon color={color} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            tabBarLabel: '통계',
            tabBarIcon: ({color, focused}) => (
              <StatsTabIcon color={color} focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
