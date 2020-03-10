import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '@/auth/login';
import HomeScreen from '@/home';
import Settings from '@/settings';
import CreateProduct from '@/products/create';

import { useAuth } from '@/services/auth';

export default (): React.ReactElement => {
  const Stack = createStackNavigator();

  const { fetching: fetchingUser, user } = useAuth();

  return fetchingUser ? null : (
    <NavigationContainer>
      <Stack.Navigator headerMode="none" initialRouteName={user ? 'Home' : 'Auth'}>
        <Stack.Screen name="Auth" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="products/create" component={CreateProduct} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
