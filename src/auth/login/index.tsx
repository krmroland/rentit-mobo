import React from 'react';
import { View } from 'react-native';
import { useDeviceName, getUniqueId } from 'react-native-device-info';
import get from 'lodash/get';
import { tw } from 'react-native-tailwindcss';
import { Layout, StyleService, Text, useStyleSheet, Icon, Card } from '@ui-kitten/components';
import { EyeIcon, EyeOffIcon, PersonIcon } from './extra/icons';
import { KeyboardAvoidingView } from './extra/3rd-party';
import { useAPIForm, Input, Button } from '@/services/forms';

import { login } from '@/services/auth';

export default ({ navigation }): React.ReactElement => {
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const [error, updateError] = React.useState<string | null>(null);
  const deviceName = useDeviceName(); // { loading: true, result: "Becca's iPhone 6"}

  const form = useAPIForm([
    { name: 'email', rules: 'required|email' },
    { name: 'password', rules: 'required|min:6' },
  ]);

  const styles = useStyleSheet(themedStyles);

  const onSignUpButtonPress = (): void => {
    // navigation && navigation.navigate('SignUp2');
  };

  const onForgotPasswordButtonPress = (): void => {
    // navigation && navigation.navigate('ForgotPassword');
  };

  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  const onPressLoginButton = (): void => {
    updateError(null);

    form.post('api/v1/auth/token', {
      beforeSubmit: data => ({ ...data, device_name: deviceName.result, device_id: getUniqueId() }),
      onSuccess(user) {
        login(user)
          .then(console.log('all went well'))
          .catch(error => console.log(error));
      },
      onError(error) {
        const message = get(
          error,
          'response.data.message',
          get(error, 'message', 'Something went wrong'),
        );
        updateError(message);
      },
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text category="h1" status="control">
          Rentals
        </Text>
        <Text style={styles.signInLabel} category="s2" status="control">
          Sign in to your account
        </Text>
      </View>
      <Layout style={styles.formContainer}>
        {error && (
          <Card style={[tw.mB3, tw.bgRed200, tw.roundedNone]} appearance="filled">
            <Text style={[]} status="danger" category="h6">
              {error}
            </Text>
          </Card>
        )}
        <Input
          placeholder="Email"
          value={form.values.email}
          icon={PersonIcon}
          error={form.errors.email}
          onChangeText={form.handleChange('email')}
        />

        <Input
          style={styles.passwordInput}
          value={form.values.password}
          error={form.errors.password}
          onChangeText={form.handleChange('password')}
          placeholder="Password"
          icon={passwordVisible ? EyeIcon : EyeOffIcon}
          secureTextEntry={!passwordVisible}
          onIconPress={onPasswordIconPress}
        />
        <View style={styles.forgotPasswordContainer}>
          <Button
            style={styles.forgotPasswordButton}
            appearance="ghost"
            status="basic"
            onPress={onForgotPasswordButtonPress}
          >
            Forgot your password?
          </Button>
        </View>
      </Layout>
      <Button
        style={styles.signInButton}
        iconName="lock-outline"
        loading={form.isBusy || deviceName.loading}
        onPress={onPressLoginButton}
        disabled={form.hasErrors}
      >
        SIGN IN
      </Button>
      <Button
        style={styles.signUpButton}
        appearance="ghost"
        status="basic"
        onPress={onSignUpButtonPress}
      >
        Don't have an account? Create
      </Button>
    </KeyboardAvoidingView>
  );
};

const themedStyles = StyleService.create({
  container: {
    backgroundColor: 'background-basic-color-1',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 216,
    backgroundColor: 'color-primary-default',
  },
  formContainer: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  signInLabel: {
    marginTop: 16,
  },
  signInButton: {
    marginHorizontal: 16,
  },
  signUpButton: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  passwordInput: {
    marginTop: 16,
  },
  forgotPasswordButton: {
    paddingHorizontal: 0,
  },
});
