import React from 'react';
import { StyleSheet } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { Icon } from '@ui-kitten/components';

export default props => {
  const {
    iconName,
    error,
    icon = null,
    style,
    size = 'large',
    status = 'basic',
    ...inputProps
  } = props;

  return {
    size,
    style: [tw.mB5, StyleSheet.flatten(style)],
    status: error ? 'danger' : status,
    caption: error,
    icon: iconName ? styles => <Icon name={iconName} {...styles} /> : icon,
    ...inputProps,
  };
};
