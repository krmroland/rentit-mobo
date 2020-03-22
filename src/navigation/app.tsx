import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '@/auth/login/screen';
import HomeScreen from '@/home';
import Settings from '@/settings';
import CreateProduct from '@/products/create';

import { AuthContext } from '@/auth';

const Stack = createStackNavigator();

export default ({ bootstraping }): React.ReactElement => {
  const { user } = React.useContext(AuthContext);

  return (
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
