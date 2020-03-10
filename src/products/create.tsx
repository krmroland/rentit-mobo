import * as React from 'react';
import { View } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { Appbar, Avatar, Title, Card } from 'react-native-paper';

import { Input, Button } from '@/services/forms';

export default ({ navigation }) => {
  return (
    <React.Fragment>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="New Product" />
      </Appbar.Header>
      <View style={[tw.mT2, tw.pX2]}>
        <Card>
          <Card.Title title="Create A new product" />
          <Card.Content>
            <View style={[tw.flex]}>
              <Input label="Name" />
              <Input label="Name" />
              <Input label="Name" />
              <Button mode="contained" icon="login">
                Save
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </React.Fragment>
  );
};
