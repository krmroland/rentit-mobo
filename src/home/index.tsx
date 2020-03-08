import React from 'react';
import { Text } from 'react-native';
import { Appbar } from 'react-native-paper';
import Tabs from './tabs';

import SQLite from 'react-native-sqlite-storage';

export default () => {
  var db = SQLite.openDatabase(
    'test.db',
    '1.0',
    'Test Database',
    200000,
    () => {
      console.log('opened');
    },
    () => {
      console.log('closed');
    },
  );
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM Employees a, Departments b WHERE a.department = b.department_id',
      [],
      (tx, results) => {
        console.log('Query completed');

        // Get rows with Web SQL Database spec compliance.

        var len = results.rows.length;
        for (let i = 0; i < len; i++) {
          let row = results.rows.item(i);
          console.log(`Employee name: ${row.name}, Dept Name: ${row.deptName}`);
        }

        // Alternatively, you can use the non-standard raw method.

        /*
        let rows = results.rows.raw(); // shallow copy of rows Array

        rows.map(row => console.log(`Employee name: ${row.name}, Dept Name: ${row.deptName}`));
      */
      },
    );
  });
  const goBack = () => console.log('Went back');

  const handleSearch = () => console.log('Searching');

  const handleMore = () => console.log('Shown more');

  return (
    <React.Fragment>
      <Appbar.Header>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title="RENTIT"></Appbar.Content>
        <Appbar.Action icon="magnify" onPress={handleSearch} />
        <Appbar.Action icon="dots-vertical" onPress={handleMore} />
      </Appbar.Header>
      <Tabs />
    </React.Fragment>
  );
};
