import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Tab, TabView, Icon } from '@ui-kitten/components';
import Tenants from './tenants';

const HomeTabs = ({ navigation, state }): React.ReactElement => {
  const onTabSelect = (index: number): void => {
    navigation.navigate(state.routeNames[index]);
  };

  const renderTab = (route: string): React.ReactElement => (
    <Tab key={route} title={route.toUpperCase()} />
  );

  return (
    <TabView selectedIndex={state.index} onSelect={onTabSelect}>
      {state.routeNames.map(renderTab)}
    </TabView>
  );
};

const TopTab = createMaterialTopTabNavigator();

export default (): React.ReactElement => {
  //tabBar={props => <HomeTabs {...props} />}
  return (
    <TopTab.Navigator tabBar={props => <HomeTabs {...props} />}>
      <TopTab.Screen name="Products" component={Tenants} />
      <TopTab.Screen name="Tenants" component={Tenants} />
      <TopTab.Screen name="Payments" component={Tenants} />
    </TopTab.Navigator>
  );
};
