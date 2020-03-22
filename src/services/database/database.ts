import Sqlite from 'react-native-sqlite-storage';
import { isNil, get } from 'lodash';

import { Builder, Compiler } from './builder';

import { createTablesIfTheyDontExist, perepareInsert } from './utils';

import { Collection, CollectionDefinition } from './collections';

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
   * The available collections
   * @type {Map<string, Collection>}
   */
  protected collections: Map<string, Collection>;

  /**
   * Creates an instance of this class
   */
  constructor(name?: string) {
    this.name = normalizeDatabaseName(name);
    this.loadIfNotLoaded();
    this.collections = new Map();
  }
  /**
   * Sets a database name
   * @param {string} name
   */
  setName(name: string = null) {
    let newName = normalizeDatabaseName(name);

    if (newName !== this.name) {
      this.name = newName;
      this.loaded = false;
      this.connection = null;
    }

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

  loadUserDatabase(user) {
    return this.setName(user ? `renit_${user.id}.db` : null).loadIfNotLoaded();
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
  insert(sql, bindings) {
    return this.executeSql(sql, bindings).then(results => {
      return Promise.resolve(results[0]);
    });
  }

  executeSql(sql, bindings = [], builder) {
    return this.acquireConnection().then(connection => {
      if (__DEV__) {
        console.log({ sql, bindings, database: this.name });
      }
      return connection.executeSql(sql, bindings).then(results => Promise.resolve(results[0]));
    });
  }

  query() {
    return new Builder(new Compiler(), this);
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

  defineCollection(definition: CollectionDefinition) {
    if (!this.collections.has(definition.name)) {
      this.collections.set(definition.name, new Collection(definition, this));
    }
    return this;
  }

  collection(name) {
    if (this.collections.has(name)) {
      return this.collections.get(name);
    }
    throw new Error(`Undefined collection with name: ${name}`);
  }
}

export default Database;
