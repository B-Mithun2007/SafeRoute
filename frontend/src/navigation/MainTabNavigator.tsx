/**
 * MainTabNavigator
 * Bottom navigation bar with 5 primary sections:
 * 1. Home
 * 2. Explore Map
 * 3. Reports
 * 4. Safety (Heatmap)
 * 5. Profile
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import IncidentReportScreen from '../screens/IncidentReportScreen';
import HeatmapScreen from '../screens/HeatmapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'MapTab':
              iconName = focused ? 'navigate' : 'navigate-outline';
              break;
            case 'ReportsTab':
              iconName = focused ? 'warning' : 'warning-outline';
              break;
            case 'SafetyTab':
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return (
            <View style={focused ? styles.activeIconPill : null}>
              <Ionicons name={iconName} size={size || 22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{ tabBarLabel: 'Map' }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={IncidentReportScreen}
        options={{ tabBarLabel: 'Report' }}
      />
      <Tab.Screen
        name="SafetyTab"
        component={HeatmapScreen}
        options={{ tabBarLabel: 'Safety' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  activeIconPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
  },
});

export default MainTabNavigator;
