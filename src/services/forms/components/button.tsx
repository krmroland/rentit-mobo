import React from 'react';
import { ActivityIndicator } from 'react-native';

import { Button, Icon } from '@ui-kitten/components';

export default props => {
  const { loading, iconName, ...buttonProps } = props;

  const stateProps = {
    disabled: !!(props.loading || props.disabled),
  };

  if (iconName) {
    stateProps.icon = styles => <Icon name={iconName} {...styles} />;
  }

  if (loading) {
    stateProps.icon = styles => <ActivityIndicator color={styles.tintColor} />;
  }

  return <Button {...buttonProps} {...stateProps} />;
};
