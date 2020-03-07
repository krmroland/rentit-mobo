import React from 'react';

import { Input, Icon } from '@ui-kitten/components';

export default props => {
  const { iconName, error, status = 'basic', size = 'large', ...inputProps } = props;

  const iconProps = {};

  if (iconName) {
    iconProps.icon = styles => <Icon name={iconName} {...styles} />;
  }

  return (
    <Input
      size={size}
      autoCapitalize="none"
      auto
      {...{ ...inputProps, ...iconProps }}
      status={error ? 'danger' : status}
      caption={error}
    />
  );
};
