import Sqlite from 'react-native-sqlite-storage';
import isNil from 'lodash/isNil';

import Collection from './collection';

import { createDatabaseTables, perepareInsert } from './sql';

class Database {
  /**
   * The current database connection
   * @type {mixed}
   */
  protected connection;
  /**
   * The current user id
   * @type {number}
   */
  protected userId: number;
  /**
   * The account id
   * @type {number}
   */
  protected accountId: number;
  /**
   * Creates an instance of this class
   * @param {number} userId
   * @param {number} accountId
   */
  constructor(userId: number, accountId: number) {
    if (isNil(userId)) {
      throw new Error('accountId is required while creating database');
    }

    if (isNil(accountId)) {
      throw new Error('accountId is required while creating database');
    }

    if (!Number.isInteger(+accountId)) {
      throw new Error('account Id must be number');
    }

    this.userId = userId;

    this.accountId = +accountId;
  }
  /**
   * Acquires.a database connection
   */
  acquireConnection() {
    return new Promise((resolve, reject) => {
      if (this.connection) {
        resolve(this.connection);
        return;
      }

      Sqlite.enablePromise(true);
      // we fetch one
      Sqlite.openDatabase({ name: `rentit${this.userId}.db` })
        .then(connection => {
          this.connection = connection;
          resolve(connection);
        })
        .catch(reject);
    });
  }

  makeTransaction() {
    return this.acquireConnection().then(connection => {
      return connection.transaction(transaction => {
        return Promise.resolve(transaction);
      });
    });
  }
  createUserTableIfDoesntExits() {
    return this.acquireConnection().then(connection => {
      return connection.sqlBatch(createDatabaseTables());
    });
  }

  collection(name) {
    return new Collection(name, this);
  }
  /**
   * Inserts an item into the database
   * @param {string} collection
   * @param {object} data
   */
  insert(collection, data) {
    return this.acquireConnection().then(connection => {
      const { sql, bindings } = perepareInsert(this.tableName, this.accountId, collection, data);

      if (__DEV__) {
        console.log({ sql, bindings });
      }

      return connection.executeSql(sql, bindings).then(results => {
        console.log({ results });
        return Promise.resolve(results);
      });
    });
  }

  whereData() {
    return this.acquireConnection().then(connection => {
      return connection.executeSql(`select json_extract(data, "$.name") as name from user_2_table`);
    });
  }
  /**
   * Gets the table name
   */
  protected get tableName() {
    return `user_${this.userId}_table`;
  }
}

export default Database;
