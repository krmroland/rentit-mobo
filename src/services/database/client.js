import SQLite from 'react-native-sqlite-storage';

const Bluebird = require('bluebird');

const Raw = require('./raw');
const Ref = require('./ref');
const Runner = require('./runner');
const Formatter = require('./formatter');

const QueryBuilder = require('./query/builder');
const QueryCompiler = require('./query/compiler');

const SchemaBuilder = require('./schema/builder');
const SchemaCompiler = require('./schema/compiler');
const TableBuilder = require('./schema/tablebuilder');
const TableCompiler = require('./schema/tablecompiler');
const ColumnBuilder = require('./schema/columnbuilder');
const ColumnCompiler = require('./schema/columncompiler');

const inherits = require('inherits');

const { EventEmitter } = require('events');

const { makeEscape } = require('./query/string');
const { assign, cloneDeep, map, uniqueId, clone, get } = require('lodash');

const Logger = require('./logger');

const debug = require('debug')('knex:client');
const debugQuery = require('debug')('knex:query');
const debugBindings = require('debug')('knex:bindings');

// The base client provides the general structure
// for a dialect specific client object.
function Client(config = {}) {
  this.config = config;
  this.logger = new Logger(config);

  if (config.version) {
    this.version = config.version;
  }

  this.connectionSettings = cloneDeep(config.connection || {});

  this.valueForUndefined = this.raw('DEFAULT');
}

inherits(Client, EventEmitter);

assign(Client.prototype, {
  formatter(builder) {
    return new Formatter(this, builder);
  },

  queryBuilder() {
    return new QueryBuilder(this);
  },

  queryCompiler(builder) {
    return new QueryCompiler(this, builder);
  },

  schemaBuilder() {
    return new SchemaBuilder(this);
  },

  schemaCompiler(builder) {
    return new SchemaCompiler(this, builder);
  },

  tableBuilder(type, tableName, fn) {
    return new TableBuilder(this, type, tableName, fn);
  },

  tableCompiler(tableBuilder) {
    return new TableCompiler(this, tableBuilder);
  },

  columnBuilder(tableBuilder, type, args) {
    return new ColumnBuilder(this, tableBuilder, type, args);
  },

  columnCompiler(tableBuilder, columnBuilder) {
    return new ColumnCompiler(this, tableBuilder, columnBuilder);
  },

  runner(builder) {
    return new Runner(this, builder);
  },

  transaction(connection) {
    return connection.transaction(tx => {});
  },

  raw() {
    return new Raw(this).set(...arguments);
  },

  ref() {
    return new Ref(this, ...arguments);
  },

  _formatQuery(sql, bindings, timeZone) {
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
      return this._escapeBinding(value, { timeZone });
    });
  },

  _escapeBinding: makeEscape({
    escapeString(str) {
      return `'${str.replace(/'/g, "''")}'`;
    },
  }),

  query(connection, obj) {
    if (typeof obj === 'string') {
      obj = { sql: obj };
    }
    obj.bindings = this.prepBindings(obj.bindings);

    const { __knexUid, __knexTxId } = connection;

    this.emit('query', assign({ __knexUid, __knexTxId }, obj));
    debugQuery(obj.sql, __knexTxId);
    debugBindings(obj.bindings, __knexTxId);

    obj.sql = this.positionBindings(obj.sql);

    return this._query(connection, obj).catch(err => {
      err.message = this._formatQuery(obj.sql, obj.bindings) + ' - ' + err.message;
      this.emit('query-error', err, assign({ __knexUid, __knexTxId }, obj));
      throw err;
    });
  },

  stream(connection, obj, stream, options) {
    const client = this;

    if (typeof obj === 'string') {
      obj = { sql: obj };
    }
    obj.bindings = this.prepBindings(obj.bindings);

    const { __knexUid, __knexTxId } = connection;

    this.emit('query', assign({ __knexUid, __knexTxId }, obj));
    debugQuery(obj.sql, __knexTxId);
    debugBindings(obj.bindings, __knexTxId);

    obj.sql = this.positionBindings(obj.sql);

    return this._stream(connection, obj, stream, options);
  },

  prepBindings(bindings) {
    return bindings;
  },

  positionBindings(sql) {
    return sql;
  },

  postProcessResponse(resp, queryContext) {
    if (this.config.postProcessResponse) {
      return this.config.postProcessResponse(resp, queryContext);
    }
    return resp;
  },

  wrapIdentifier(value, queryContext) {
    return this.customWrapIdentifier(value, this.wrapIdentifierImpl, queryContext);
  },

  customWrapIdentifier(value, origImpl, queryContext) {
    if (this.config.wrapIdentifier) {
      return this.config.wrapIdentifier(value, origImpl, queryContext);
    }
    return origImpl(value);
  },

  wrapIdentifierImpl(value) {
    return value !== '*' ? `"${value.replace(/"/g, '""')}"` : '*';
  },

  // Acquire a connection from the pool.
  acquireConnection() {
    SQLite.enablePromise(true);
    return SQLite.openDatabase('rentit.db', '1.0', 'Test Database');
  },

  // Used to explicitly close a connection, called internally by the pool when
  // a connection times out or the pool is shutdown.
  destroyRawConnection(connection) {
    return Bluebird.fromCallback(connection.close.bind(connection));
  },

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
  },

  _stream(connection, sql, stream) {
    const client = this;
    return new Bluebird(function(resolver, rejecter) {
      stream.on('error', rejecter);
      stream.on('end', resolver);
      return client
        ._query(connection, sql)
        .then(obj => obj.response)
        .map(row => {
          stream.write(row);
        })
        .catch(function(err) {
          stream.emit('error', err);
        })
        .then(function() {
          stream.end();
        });
    });
  },

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
  },

  toString() {
    return '[object KnexClient]';
  },

  canCancelQuery: false,
});

module.exports = Client;
