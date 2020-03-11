import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default () => {
  const [visible, updateVisible] = React.useState<boolean>(false);
  return (
    <View style={styles.container}>
      <Snackbar
        visible={this.state.visible}
        onDismiss={() => updateVisible(false)}
        action={{
          label: 'Undo',
          onPress: () => {},
        }}
      >
        Hey there! I'm a Snackbar.
      </Snackbar>
    </View>
  );
};
