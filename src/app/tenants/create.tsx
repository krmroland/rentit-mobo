import * as React from 'react';
import { View } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { Appbar, Avatar, Title, Snackbar } from 'react-native-paper';
import { KeyboardAvoidingView } from '@/components';
import { Card, Icon } from '@ui-kitten/components';
import database from '@/data/db';

import { Input, Button, Select, useDatabaseCollectionForm } from '@/services/forms';

export default ({ navigation }) => {
  const form = useDatabaseCollectionForm('tenants');

  const onSubmit = () => {
    form.create({
      onSuccess: () => {
        navigation.goBack();
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
        <Appbar.Content title="New Tenant" titleStyle={[tw.text2xl]} />
      </Appbar.Header>
      <KeyboardAvoidingView style={[tw.bgWhite]}>
        <View style={[tw.bgGray100, tw.pY5, tw.itemsCenter]}>
          <Avatar.Icon icon="shield-account-outline" size={100} />
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
              label="First Name"
              iconName="book-outline"
              value={form.values.first_name}
              onChangeText={form.handleChange('first_name')}
              error={form.errors.first_name}
            />

            <Input
              label="Last Name"
              iconName="book-outline"
              value={form.values.last_name}
              onChangeText={form.handleChange('last_name')}
              error={form.errors.last_name}
            />
            <Input
              label="Email"
              iconName="book-outline"
              value={form.values.email}
              onChangeText={form.handleChange('email')}
              error={form.errors.email}
            />
            <Input
              label="Phone Number"
              iconName="book-outline"
              value={form.values.phone_number}
              onChangeText={form.handleChange('phone_number')}
              error={form.errors.phone_number}
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
