import * as React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import withObservables from '@nozbe/with-observables';
import { Avatar, Button, Card, Title, Paragraph, FAB, useTheme } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/hooks';

const Products = ({ navigation }) => {
  const theme = useTheme();

  const [products, updateProducts] = React.useState([]);

  const observer = useDatabase()
    .collections.get('products')
    .query()
    .observe();

  React.useEffect(() => {
    let subscription = observer.subscribe(data => updateProducts(data));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    <View style={{ flex: 1 }}>
      <FlatList
        style={[tw.pX2, tw.mT3]}
        data={products}
        renderItem={({ item }) => {
          return (
            <Card style={[tw.mB3]}>
              <Card.Title
                title={item.name}
                left={props => (
                  <Avatar.Icon
                    {...props}
                    icon={item.type === 'House' ? 'shield-home-outline' : 'car'}
                    size={50}
                  />
                )}
              />
              <Card.Content>
                <Title>{item.name}</Title>
                <Paragraph>Card content</Paragraph>
              </Card.Content>

              <Card.Actions>
                <Button>Cancel</Button>
                <Button>Ok</Button>
              </Card.Actions>
            </Card>
          );
        }}
      ></FlatList>
      <FAB icon="plus" onPress={() => navigation.navigate('products/create')} style={styles.fab} />
    </View>
  );
};

export default Products;
