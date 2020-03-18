import Sqlite from 'react-native-sqlite-storage';
import { isNil, get } from 'lodash';

import { Builder, Compiler } from './builder';

import { createTablesIfTheyDontExist, perepareInsert } from './utils';

// ensure we are never connecting to a null database

const normalizeDatabaseName = given => (given ? given : 'renit.db');

class Database {
  /**
   * Determines if we have loaded the database already
   * @type {false}
   */
  public loaded: boolean;
  /**
   * The current database connection
   * @type {mixed}
   */
  protected connection;
  /**
   * The current user id
   * @type {number}
   */
  protected name: string;
  /**
   * The account id
   * @type {number}
   */
  protected accountId: number = 1;
  /**
   * The allowed connection names
   * @type {Array}
   */
  public allowedCollections = ['products', 'tenants', 'variants'];

  /**
   * Creates an instance of this class
   */
  constructor(name?: string) {
    this.name = normalizeDatabaseName(name);
    this.loadIfNotLoaded();
  }

  setName(name: string) {
    let newName = normalizeDatabaseName(name);

    if (newName !== this.name) {
      this.name = newName;
      this.loaded = false;
      this.connection = null;
    }

    return this;
  }

  setAccount(account) {
    this.accountId = get(account, 'id');
    return this;
  }

  loadIfNotLoaded() {
    if (this.loaded) {
      return Promise.resolve();
    }

    return this.createTablesIfTheyDontExits().then(() => {
      this.loaded = true;
      return Promise.resolve();
    });
  }

  loadUserDatabase(user, account) {
    if (user) {
      return this.setAccount(account)
        .setName(`renit_${user.id}.db`)
        .loadIfNotLoaded();
    }
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
      Sqlite.openDatabase({ name: this.name })
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
  createTablesIfTheyDontExits() {
    return this.acquireConnection().then(connection => {
      return connection.sqlBatch(createTablesIfTheyDontExist());
    });
  }

  /**
   * Inserts an item into the database
   * @param {string} collection
   * @param {object} data
   */
  insertCollection(collection, data) {
    console.log({ accountId: this.accountId });
    const { sql, bindings } = perepareInsert(1, collection, data);

    return this.executeSql(sql, bindings).then(results => {
      console.log({ results });
      return Promise.resolve(results);
    });
  }

  executeSql(sql, bindings = []) {
    return this.acquireConnection().then(connection => {
      if (__DEV__) {
        console.log({ sql, bindings });
      }
      return connection.executeSql(sql, bindings).then(results => Promise.resolve(results[0]));
    });
  }

  collection(name) {
    return this.query.from('documents').where('collection', name);
  }

  get query() {
    return new Builder(this, new Compiler());
  }

  ensureUserIdAndAccountNumberAreSet() {
    if (isNil(this.accountId)) {
      throw new Error('accountId is required for persisting records');
    }

    if (!Number.isInteger(+this.accountId)) {
      throw new Error('account Id must be number');
    }

    return this;
  }
}

export default new Database();
