import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';

import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '@/auth/login';
import HomeScreen from '@/home';

import { useAuth } from '@/services/auth';

export default (): React.ReactElement => {
  const Stack = createStackNavigator();

  const { fetching: fetchingUser, user } = useAuth();

  React.useEffect(() => {
    if (!fetchingUser) {
      BootSplash.hide({ duration: 250 });
    }
  }, [fetchingUser]);

  return fetchingUser ? null : (
    <NavigationContainer>
      <Stack.Navigator headerMode="none" initialRouteName={user ? 'Home' : 'Auth'}>
        <Stack.Screen name="Auth" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
