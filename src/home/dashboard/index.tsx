import * as React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { Avatar, Button, Card, Title, Paragraph, FAB, useTheme } from 'react-native-paper';

const MusicRoute = () => <Text>Music</Text>;

const AlbumsRoute = () => <Text>Albums</Text>;

const RecentsRoute = () => <Text>Recents</Text>;

export default ({ navigation }) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 20,
      backgroundColor: theme.colors.primary,
    },
  });
  return (
    <View>
      <FlatList
        style={[tw.pX2, tw.mT3]}
        data={[1, 2, 3, 4, 5].map(id => ({ id: String(id) }))}
        renderItem={() => (
          <Card style={[tw.mB3]}>
            <Card.Title
              title="Product Name"
              left={props => <Avatar.Icon {...props} icon="shield-home-outline" />}
            />
            <Card.Content>
              <Title>Card title</Title>
              <Paragraph>Card content</Paragraph>
            </Card.Content>

            <Card.Actions>
              <Button>Cancel</Button>
              <Button>Ok</Button>
            </Card.Actions>
          </Card>
        )}
      ></FlatList>
      <FAB icon="plus" onPress={() => navigation.navigate('products/create')} style={styles.fab} />
    </View>
  );
};
