import * as React from 'react';
import { View } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { Appbar, Avatar, Title, Snackbar } from 'react-native-paper';
import { KeyboardAvoidingView } from '@/components';
import { Card, Icon } from '@ui-kitten/components';
import database from '@/data/db';

import { Input, Button, Select, useDatabaseCollectionForm } from '@/services/forms';

export default ({ navigation }) => {
  const form = useDatabaseCollectionForm('products');

  const onSubmit = () => {
    form.create({
      onSuccess(product) {
        navigation.goBack();
        // do some notification
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
            <Select
              label="Account"
              options={form.fields.accountId.options}
              value={form.values.accountId}
              onChangeText={form.handleChange('accountId')}
            />
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
              options={form.fields.currency.options}
              value={form.values.currency}
              onChangeText={form.handleChange('currency')}
            />
            <Select
              label="Type"
              options={form.fields.type.options}
              error={form.errors.type}
              value={form.values.type}
              onChangeText={form.handleChange('type')}
            />
          </View>

          <Button
            iconName="plus-square-outline"
            style={[tw.mY10]}
            loading={form.isBusy}
            onPress={onSubmit}
            disabled={form.hasErrors || form.isBusy}
          >
            Save
          </Button>
        </View>
      </KeyboardAvoidingView>
    </React.Fragment>
  );
};
