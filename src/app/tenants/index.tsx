import * as React from 'react';
import { sample } from 'lodash';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { tw } from 'react-native-tailwindcss';

import { useCollection } from '@/data/hooks';

import { List, FAB, useTheme, Avatar, Divider, Title } from 'react-native-paper';

const Products = ({ navigation }) => {
  const theme = useTheme();

  const colors = ['#1976d2', '#1b5e20', '#FF4242', '#931060', '#002D4B', '#101793'];

  const { results: tenants, refresh, refreshing } = useCollection('tenants', {
    orderBy: 'data->first_name',
    direction: 'asc',
  });

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
    <View style={[tw.flex1, tw.bgWhite]}>
      <FlatList
        onRefresh={refresh}
        style={[tw.mT3]}
        data={tenants}
        refreshing={refreshing}
        renderItem={({ item, index }) => {
          // get a random color

          const colorIndex = index < colors.length ? index : colors.length % index;

          return (
            <React.Fragment>
              <List.Item
                onPress={() => console.log('pressed')}
                title={`${item.get('first_name')} ${item.get('last_name')}`}
                description={item.get('phone_number') || item.get('email') || 'N/A'}
                titleStyle={[tw.fontBold]}
                descriptionStyle={[tw.textBase, tw.mT1]}
                left={({ style }) => (
                  <View
                    style={[tw.justifyCenter, tw.itemsCenter, tw.mR1, style]}
                    pointerEvents="box-none"
                  >
                    <Avatar.Icon
                      icon="account"
                      size={50}
                      style={{ backgroundColor: colors[colorIndex] }}
                    />
                  </View>
                )}
                right={({ style }) => (
                  <View style={[tw.mT3]} pointerEvents="box-none">
                    <Text> UGX 1000 </Text>
                  </View>
                )}
              />
              <Divider style={[tw.mT3]} />
            </React.Fragment>
          );
        }}
      />
      <FAB icon="plus" onPress={() => navigation.navigate('tenants/create')} style={styles.fab} />
    </View>
  );
};

export default Products;
