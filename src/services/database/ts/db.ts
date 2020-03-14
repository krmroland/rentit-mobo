import collect from 'collect.js';

import Bluebird from 'bluebird';

import Migrator from './migrate/migrator';

import methods from '../query/methods';

import batchInsert from './utils/batchInsert';

class DB {
  public client;

  constructor(client) {
    this.client = client;
  }

  queryBuilder() {
    return this.client.queryBuilder();
  }

  raw(...parmeters) {
    return this.client.raw.apply(this.client, parmeters);
  }

  batchInsert(table, batch, chunkSize = 1000) {
    return batchInsert(this, table, batch, chunkSize);
  }

  transaction(callback: Function) {
    return new Bluebird((resolve, reject) => {
      this.client.useTransactions(true);

      return Promise.resolve(callback(this))
        .then(response => {
          this.client.useTransactions(false);
          return Promise.resolve(response);
        })
        .catch(error => {
          this.client.useTransactions(false);
          return Promise.reject(error);
        });
    });
  }

  // Convenience method for tearing down the pool.
  destroy(callback) {
    return this.client.destroy(callback);
  }
  migrations() {
    return new Migrator(this);
  }

  get schema() {
    return this.client.schemaBuilder();
  }
}

collect(methods).each(methodName => {
  DB.prototype[methodName] = function(...parmeters) {
    return this.queryBuilder()[methodName](...parmeters);
  };
});

export default DB;
