import * as React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import database from '@/services/database';

import { Avatar, Button, Card, Title, Paragraph, FAB, useTheme } from 'react-native-paper';

const Products = ({ navigation }) => {
  const theme = useTheme();

  const [products, updateProducts] = React.useState([]);

  React.useEffect(() => {
    database
      .collection('products')
      .get()
      .then(results => {
        updateProducts(results.items().all());
      });
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
          console.log(item);
          return (
            <Card style={[tw.mB3]}>
              <Card.Title
                title={item.dataField('name')}
                left={props => (
                  <Avatar.Icon
                    {...props}
                    icon={item.dataField('type') === 'House' ? 'shield-home-outline' : 'car'}
                    size={50}
                  />
                )}
              />
              <Card.Content>
                <Title>{item.dataField('name')}</Title>
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
