import React from 'react';
import { range } from 'lodash';
import database from '../db';

interface Options {
  orderBy?: string;
  direction?: string;
}
export default (name, options: Options = {}) => {
  const collection = database.collection(name);

  const [refreshing, updateRefreshing] = React.useState<boolean>(false);

  const [results, updateResults] = React.useState([]);

  const fetchResults = () => {
    updateRefreshing(true);
    collection.query
      .orderBy(options.orderBy || 'updatedAt', options.direction || 'desc')
      .get()
      .then(results => {
        updateRefreshing(false);
        updateResults(results.items());
      })
      .catch(error => {
        updateRefreshing(false);
        // log the error some where
        return Promise.reject(error);
      });
  };

  // observable

  React.useEffect(fetchResults, []);

  React.useEffect(() => {
    let subscription = collection.insert$.subscribe(item => {
      // add item to available  items
      updateResults([item, ...results]);
    });

    return () => subscription && subscription.unsubscribe();
  });

  return { results, refreshing, refresh: fetchResults };
};
