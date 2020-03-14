import * as React from 'react';
import { View } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { Appbar, Avatar, Title, Snackbar } from 'react-native-paper';
import { KeyboardAvoidingView } from '@/components';
import { Card, Icon } from '@ui-kitten/components';

import { Input, Button, Select, useDatabaseForm } from '@/services/forms';

import { AuthContext } from '@/auth';

export default ({ navigation }) => {
  const [submitting, updateSubmitting] = React.useState<boolean>(false);

  const { currentAccountId, userId } = React.useContext(AuthContext);

  const form = useDatabaseForm('products', [
    { name: 'userId', rules: 'required', defaultValue: userId },
    { name: 'accountId', rules: 'required', defaultValue: currentAccountId },
    { name: 'name', rules: 'required|max:25' },
    { name: 'currency', rules: 'required', defaultValue: 'UGX' },
    { name: 'type', rules: 'required', defaultValue: 'House' },
  ]);

  const onSubmit = () => {
    form.persist(() => {}, {
      onSuccess(product) {
        //console.log({ product });
        //navigation.goBack();
      },
      onError(e) {
        console.log(e);
      },
    });
  };

  return (
    <React.Fragment>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="New Product" titleStyle={[tw.text2xl]} />
      </Appbar.Header>
      <KeyboardAvoidingView style={[tw.bgWhite]}>
        <View style={[tw.bgGray100, tw.pY5, tw.itemsCenter]}>
          <Avatar.Icon icon="shield-home-outline" size={100} />
        </View>

        <View style={[tw.mT2, tw.pX5, tw.flex, tw.itemsStretch, tw.justifyBetween, tw.flex1]}>
          <View style={[tw.flex, tw.mT2]}>
            <Input
              label="Name"
              placeholder="Product name"
              iconName="book-outline"
              value={form.values.name}
              onChangeText={form.handleChange('name')}
              error={form.errors.name}
            />
            <Select
              label="Currency"
              data={[{ text: 'UGX' }, { text: 'USD' }]}
              value={form.values.currency}
              onChangeText={form.handleChange('currency')}
            />
            <Select
              label="Type"
              data={[{ text: 'House' }, { text: 'Car' }]}
              error={form.errors.type}
              value={form.values.type}
              onChangeText={form.handleChange('type')}
            />
          </View>

          <Button
            iconName="plus-square-outline"
            style={[tw.mY10]}
            loading={submitting}
            onPress={onSubmit}
            disabled={form.hasErrors || submitting}
          >
            Save
          </Button>
        </View>
      </KeyboardAvoidingView>
    </React.Fragment>
  );
};
