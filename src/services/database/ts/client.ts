import SQLite from 'react-native-sqlite-storage';
import { assign, cloneDeep, map, uniqueId, clone, get } from 'lodash';
import Bluebird from 'bluebird';

import Raw from './raw';
import Runner from './runner';
import Formatter from './formatter';
import QueryBuilder from './query/builder';
import QueryCompiler from './query/compiler';

import SchemaBuilder from './schema/builder';
import SchemaCompiler from './schema/compiler';
import TableBuilder from './schema/tablebuilder';
import TableCompiler from './schema/tablecompiler';
import ColumnBuilder from './schema/columnbuilder';
import ColumnCompiler from './schema/columncompiler';

import { makeEscape } from './query/string';

import Logger from './logger';

import debug from 'debug';

const debugQuery = debug('builder:query');
const debugBindings = debug('builder:bindings');

class Client {
  public config;
  public logger;
  public valueForUndefined;
  protected isUsingTransactions: boolean;

  constructor(config) {
    this.config = config;
    this.logger = new Logger();
    this.valueForUndefined = this.raw('DEFAULT');
  }

  formatter(builder) {
    return new Formatter(this, builder);
  }

  queryBuilder() {
    return new QueryBuilder(this);
  }

  queryCompiler(builder) {
    return new QueryCompiler(this, builder);
  }

  schemaBuilder() {
    return new SchemaBuilder(this);
  }

  schemaCompiler(builder) {
    return new SchemaCompiler(this, builder);
  }
  useTransactions(isUsingTransactions: boolean = true) {
    this.isUsingTransactions = isUsingTransactions;

    return this;
  }

  tableBuilder(type, tableName, fn) {
    return new TableBuilder(this, type, tableName, fn);
  }

  tableCompiler(tableBuilder) {
    return new TableCompiler(this, tableBuilder);
  }

  columnBuilder(tableBuilder, type, args) {
    return new ColumnBuilder(this, tableBuilder, type, args);
  }

  columnCompiler(tableBuilder, columnBuilder) {
    return new ColumnCompiler(this, tableBuilder, columnBuilder);
  }

  runner(builder) {
    return new Runner(this, builder);
  }

  transaction(connection) {
    return new Promise((resolve, reject) => {
      connection.transaction(transaction => {
        resolve(transaction);
      });
    });
  }

  raw(...parameters) {
    return new Raw(this).set(...parameters);
  }

  _formatQuery(sql, bindings, timeZone?) {
    bindings = bindings == null ? [] : [].concat(bindings);
    let index = 0;
    return sql.replace(/\\?\?/g, match => {
      if (match === '\\?') {
        return '?';
      }
      if (index === bindings.length) {
        return match;
      }
      const value = bindings[index++];
      return this.escapeBinding(value);
    });
  }

  protected escapeBinding(str) {
    makeEscape({
      escapeString(str) {
        return `'${str.replace(/'/g, "''")}'`;
      },
    });
  }

  query(connection, obj) {
    if (typeof obj === 'string') {
      obj = { sql: obj };
    }
    obj.bindings = this.prepBindings(obj.bindings);

    debugQuery(obj.sql);

    debugBindings(obj.bindings);

    obj.sql = this.positionBindings(obj.sql);

    return this._query(connection, obj).catch(err => {
      err.message = this._formatQuery(obj.sql, obj.bindings) + ' - ' + err.message;
      throw err;
    });
  }

  prepBindings(bindings) {
    return bindings;
  }

  positionBindings(sql) {
    return sql;
  }

  postProcessResponse(resp, queryContext) {
    if (this.config.postProcessResponse) {
      return this.config.postProcessResponse(resp, queryContext);
    }
    return resp;
  }

  wrapIdentifier(value, queryContext) {
    return this.customWrapIdentifier(value, this.wrapIdentifierImpl, queryContext);
  }

  customWrapIdentifier(value, origImpl, queryContext) {
    return origImpl(value);
  }

  wrapIdentifierImpl(value) {
    return value !== '*' ? `"${value.replace(/"/g, '""')}"` : '*';
  }

  // Acquire a connection from the pool.
  acquireConnection() {
    SQLite.enablePromise(true);

    return SQLite.openDatabase('rentit.db', '1.0', 'Test Database').then(connection => {
      return Promise.resolve(connection);

      if (this.isUsingTransactions) {
        connection.transaction(transaction => {
          return Promise.resolve(transaction);
        });
      }

      return Promise.resolve(connection);
    });
  }

  // Used to explicitly close a connection, called internally by the pool when
  // a connection times out or the pool is shutdown.
  destroyRawConnection(connection) {
    return Bluebird.fromCallback(connection.close.bind(connection));
  }

  // Runs the query on the specified connection, providing the bindings and any
  // other necessary prep work.
  _query(connection, obj) {
    return new Bluebird(function(resolver, rejecter) {
      connection
        .executeSql(obj.sql, obj.bindings)
        .then(response => {
          obj.response = response;

          obj.context = this;
          resolver(obj);
        })
        .catch(rejecter);
    });
  }

  // Ensures the response is returned in the same format as other clients.
  processResponse(obj, runner) {
    if (obj.output) {
      return obj.output.call(runner, obj.response);
    }

    const databaseResponse = get(obj, 'response.0');

    let data = databaseResponse.rows.raw();

    switch (obj.method) {
      case 'select':
      case 'pluck':
      case 'first':
        if (obj.method === 'pluck') {
          data = map(data, obj.pluck);
        }

        return obj.method === 'first' ? data[0] : data;
      case 'insert':
        return [databaseResponse.insertId];
      case 'del':
      case 'update':
      case 'counter':
        return databaseResponse.rowsAffected;
      default:
        return databaseResponse;
    }
  }
}

export default Client;
