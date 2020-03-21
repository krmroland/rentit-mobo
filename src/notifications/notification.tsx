import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';

export default class SnackbarNotification extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { visible: true, message: 'Test Initial Notification' };
  }

  show(message, type = 'info') {
    this.setState({ visible: true, message });
    return this;
  }

  close() {
    // this.setState({ visible: false, message: '' });
  }
  render() {
    const { colors } = this.props.theme;
    return (
      <Snackbar
        visible={this.state.visible}
        onDismiss={() => this.close()}
        style={{ elevation: 0, alignItems: 'flex-start', justifyContent: 'flex-start' }}
        duration={Snackbar.DURATION_SHORT}
      >
        {this.state.message}
      </Snackbar>
    );
  }
}
