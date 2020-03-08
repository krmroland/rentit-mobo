import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { TopNavigation, TopNavigationAction, Icon } from '@ui-kitten/components';
import { tw } from 'react-native-tailwindcss';
import { SafeAreaLayout } from '@/components/safe-area-layout';
import Dashboard from './dashboard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNavigation: {},
});

const EditIcon = style => <Icon {...style} name="search-outline" />;

const MenuIcon = style => <Icon {...style} name="more-vertical" />;

const EditAction = props => <TopNavigationAction {...props} icon={EditIcon} />;
const MenuAction = props => <TopNavigationAction {...props} icon={MenuIcon} />;

const renderRightControls = () => [<EditAction />, <MenuAction />];

export default ({ navigation }): React.ReactElement => {
  return (
    <SafeAreaLayout style={styles.container} insets="top">
      <TopNavigation
        style={styles.topNavigation}
        title="Rentals"
        titleStyle={[tw.text2xl]}
        rightControls={renderRightControls()}
      />
      <Dashboard />
    </SafeAreaLayout>
  );
};
