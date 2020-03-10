import * as React from 'react';
import { View } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { Appbar, Avatar, Title } from 'react-native-paper';

export default ({ navigation }) => {
  return (
    <React.Fragment>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      <View style={tw.mT2}>
        <View style={[tw.flex]}>
          <Avatar.Icon size={50} icon="folder" />
          <Title>Ahimbisibwe Roland</Title>
        </View>
      </View>
    </React.Fragment>
  );
};
