import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@/auth/login';

import HomeScreen from '@/home';

const Stack = createStackNavigator();

const navigatorTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default (): React.ReactElement => (
  <NavigationContainer theme={navigatorTheme}>
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="Auth" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
