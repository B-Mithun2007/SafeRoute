/**
 * MainTabNavigator
 * Responsive Application Shell:
 * - On Desktop/Tablet (width >= 768px):
 *   Renders an Obsidian Sidebar (260px) + full-bleed main content stage.
 *   The tab bar is hidden on desktop, and tab switching is driven seamlessly
 *   by the sidebar.
 * - On Mobile (width < 768px):
 *   Renders an ergonomic frosted bottom dock.
 */
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/theme';
import DesktopSidebar from '../components/DesktopSidebar';
import ErrorBoundary from '../components/ErrorBoundary';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import IncidentReportScreen from '../screens/IncidentReportScreen';
import HeatmapScreen from '../screens/HeatmapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Wrapped screen components with individual Error Boundaries to prevent total screen blanking
const SafeHomeScreen = (props: any) => (
  <ErrorBoundary fallbackTitle="Command Center Error">
    <HomeScreen {...props} />
  </ErrorBoundary>
);

const SafeMapScreen = (props: any) => (
  <ErrorBoundary fallbackTitle="Spatial Navigator Error">
    <MapScreen {...props} />
  </ErrorBoundary>
);

const SafeIncidentReportScreen = (props: any) => (
  <ErrorBoundary fallbackTitle="Hazard Dispatch Error">
    <IncidentReportScreen {...props} />
  </ErrorBoundary>
);

const SafeHeatmapScreen = (props: any) => (
  <ErrorBoundary fallbackTitle="Threat Heatmap Error">
    <HeatmapScreen {...props} />
  </ErrorBoundary>
);

const SafeProfileScreen = (props: any) => (
  <ErrorBoundary fallbackTitle="Security & Profile Error">
    <ProfileScreen {...props} />
  </ErrorBoundary>
);

export const MainTabNavigator = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={styles.shellContainer}>
      <Tab.Navigator
        tabBar={(props) => {
          if (isDesktop) {
            const currentRoute = props.state.routes[props.state.index]?.name || 'HomeTab';
            return (
              <DesktopSidebar
                currentTab={currentRoute}
                onNavigate={(tabName) => props.navigation.navigate(tabName)}
                onOpenSOS={() => navigation.navigate('SOS')}
              />
            );
          }

          // Custom Mobile Dock (only rendered when screen width < 768px)
          return (
            <View style={styles.mobileDockContainer}>
              <View style={styles.mobileDock}>
                {props.state.routes.map((route, index) => {
                  const isFocused = props.state.index === index;
                  let iconName: keyof typeof Ionicons.glyphMap;

                  switch (route.name) {
                    case 'HomeTab':
                      iconName = isFocused ? 'grid' : 'grid-outline';
                      break;
                    case 'MapTab':
                      iconName = isFocused ? 'map' : 'map-outline';
                      break;
                    case 'ReportsTab':
                      iconName = isFocused ? 'warning' : 'warning-outline';
                      break;
                    case 'SafetyTab':
                      iconName = isFocused ? 'shield-checkmark' : 'shield-checkmark-outline';
                      break;
                    case 'ProfileTab':
                      iconName = isFocused ? 'person' : 'person-outline';
                      break;
                    default:
                      iconName = 'help-circle-outline';
                  }

                  return (
                    <View
                      key={route.key}
                      onTouchEnd={() => props.navigation.navigate(route.name)}
                      style={[styles.dockItem, isFocused && styles.activeDockItem]}
                    >
                      <Ionicons
                        name={iconName}
                        size={20}
                        color={isFocused ? Theme.colors.teal : Theme.colors.textMuted}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          );
        }}
        screenOptions={{
          headerShown: false,
          tabBarPosition: isDesktop ? 'left' : 'bottom',
          sceneStyle: styles.mainContentArea,
        }}
      >
        <Tab.Screen name="HomeTab" component={SafeHomeScreen} />
        <Tab.Screen name="MapTab" component={SafeMapScreen} />
        <Tab.Screen name="ReportsTab" component={SafeIncidentReportScreen} />
        <Tab.Screen name="SafetyTab" component={SafeHeatmapScreen} />
        <Tab.Screen name="ProfileTab" component={SafeProfileScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  shellContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: Theme.colors.canvas,
  },
  mainContentArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: Theme.colors.canvas,
  },
  mobileDockContainer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  mobileDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(9, 13, 22, 0.92)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Theme.radii.full,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#090D16',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  dockItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDockItem: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
});

export default MainTabNavigator;
