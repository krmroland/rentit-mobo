import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from '@/app/auth';

const Stack = createStackNavigator();

export default ({ bootstraping }): React.ReactElement => {
  const { user } = React.useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none" initialRouteName={user ? 'Home' : 'Auth'}>
        <Stack.Screen name="Auth" component={require('@/app/auth/login').default} />
        <Stack.Screen name="Home" component={require('@/app/home').default} />
        <Stack.Screen name="Settings" component={require('@/app/settings').default} />
        <Stack.Screen name="products/create" component={require('@/app/products/create').default} />
        <Stack.Screen name="tenants/create" component={require('@/app/tenants/create').default} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
