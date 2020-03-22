import * as React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { tw } from 'react-native-tailwindcss';

import { useCollection } from '@/data/hooks';

import { Avatar, Button, Card, Title, Paragraph, FAB, useTheme } from 'react-native-paper';

const Products = ({ navigation }) => {
  const theme = useTheme();

  const { results: products, refresh, refreshing } = useCollection('products');

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
        onRefresh={refresh}
        style={[tw.pX2, tw.mT3]}
        data={products}
        refreshing={refreshing}
        renderItem={({ item }) => {
          return (
            <Card style={[tw.mB3]}>
              <Card.Title
                title={item.get('name')}
                left={props => (
                  <Avatar.Icon
                    {...props}
                    icon={item.get('type') === 'House' ? 'shield-home-outline' : 'car'}
                    size={50}
                  />
                )}
              />
              <Card.Content>
                <Title>{item.get('name')}</Title>
                <Paragraph>Card content</Paragraph>
              </Card.Content>

              <Card.Actions>
                <Button>Cancel</Button>
                <Button>Ok</Button>
              </Card.Actions>
            </Card>
          );
        }}
      />
      <FAB icon="plus" onPress={() => navigation.navigate('products/create')} style={styles.fab} />
    </View>
  );
};

export default Products;
