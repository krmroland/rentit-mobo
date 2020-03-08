import React from 'react';
import { Button } from 'react-native-paper';
export default props => {
  const { disabled, loading } = props;

  return <Button {...props} disabled={loading || disabled} loading={loading} />;
};
