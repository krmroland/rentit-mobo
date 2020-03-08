import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const HomeScreen = () => <View></View>;
const SettingsScreen = () => <View></View>;

const Tab = createMaterialTopTabNavigator();

export default () => {
  const { colors, fonts } = useTheme();

  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: 'white',
        style: { backgroundColor: colors.primary },
        labelStyle: {
          ...fonts.medium,
          color: colors.surface,

          fontSize: 16,
        },
        indicatorStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          backgroundColor: '#fff',
        },
      }}
    >
      <Tab.Screen name="Projects" component={HomeScreen} />
      <Tab.Screen name="Payments" component={HomeScreen} />
      <Tab.Screen name="Tenants" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
