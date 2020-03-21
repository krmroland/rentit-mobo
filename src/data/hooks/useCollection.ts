import React from 'react';
import { range } from 'lodash';
import database from '../db';

export default name => {
  const collection = database.collection(name);

  let [fetching, updateFetching] = React.useState<boolean>(false);

  const [results, updateResults] = React.useState([]);

  // observable

  React.useEffect(() => {
    updateFetching(true);
    collection.query
      .latest('updatedAt')
      .get()
      .then(results => {
        updateFetching(false);
        updateResults(results.items());
      })
      .catch(error => {
        updateFetching(false);
        // log the error some where
        return Promise.resolve(error);
      });
  }, []);

  React.useEffect(() => {
    let subscription = collection.insert$.subscribe(item => {
      // add item to available  items
      updateResults([item, ...results]);
    });

    return () => subscription && subscription.unsubscribe();
  });

  return { results, fetching };
};
