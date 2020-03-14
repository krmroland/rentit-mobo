import Migrator from '../migrate/migrate';

const { EventEmitter } = require('events');

const FunctionHelper = require('../functionhelper');
const QueryInterface = require('../query/methods');
const { assign } = require('lodash');
const batchInsert = require('./batchInsert');

function initContext(knexFn) {
  const knexContext = knexFn.context || {};
  assign(knexContext, {
    queryBuilder() {
      return this.client.queryBuilder();
    },

    raw() {
      return this.client.raw.apply(this.client, arguments);
    },

    batchInsert(table, batch, chunkSize = 1000) {
      return batchInsert(this, table, batch, chunkSize);
    },

    // Convenience method for tearing down the pool.
    destroy(callback) {
      return this.client.destroy(callback);
    },

    ref(ref) {
      return this.client.ref(ref);
    },
  });

  if (!knexFn.context) {
    knexFn.context = knexContext;
  }
}

function redefineProperties(knex, client) {
  // Allow chaining methods = require(the root object, before
  // any other information is specified.
  QueryInterface.forEach(function(method) {
    knex[method] = function() {
      const builder = knex.queryBuilder();
      return builder[method].apply(builder, arguments);
    };
  });

  Object.defineProperties(knex, {
    context: {
      get() {
        return knex._context;
      },
      set(context) {
        knex._context = context;

        // Redefine public API for knex instance that would be proxying methods = require(correct context
        knex.raw = context.raw;
        knex.batchInsert = context.batchInsert;
        knex.transaction = context.transaction;
        knex.transactionProvider = context.transactionProvider;
        knex.initialize = context.initialize;
        knex.destroy = context.destroy;
        knex.ref = context.ref;
        knex.withUserParams = context.withUserParams;
        knex.queryBuilder = context.queryBuilder;
        knex.disableProcessing = context.disableProcessing;
        knex.enableProcessing = context.enableProcessing;
      },
      configurable: true,
    },

    client: {
      get() {
        return knex.context.client;
      },
      set(_client) {
        knex.context.client = _client;
      },
      configurable: true,
    },

    userParams: {
      get() {
        return knex.context.userParams;
      },
      set(userParams) {
        knex.context.userParams = userParams;
      },
      configurable: true,
    },

    schema: {
      get() {
        return knex.client.schemaBuilder();
      },
      configurable: true,
    },

    migrate: {
      get() {
        return new Migrator(knex);
      },
      configurable: true,
    },

    fn: {
      get() {
        return new FunctionHelper(knex.client);
      },
      configurable: true,
    },
  });

  initContext(knex);
  knex.client = client;
  knex.client.makeKnex = makeKnex;
  knex.userParams = {};

  // Hook up the "knex" object as an EventEmitter.
  const ee = new EventEmitter();
  for (const key in ee) {
    knex[key] = ee[key];
  }

  // Unfortunately, something seems to be broken in Node 6 and removing events = require(a clone also mutates original Knex,
  // which is highly undesireable
  if (knex._internalListeners) {
    knex._internalListeners.forEach(({ eventName, listener }) => {
      knex.client.removeListener(eventName, listener); // Remove duplicates for copies
    });
  }
  knex._internalListeners = [];

  // Passthrough all "start" and "query" events to the knex object.
  _addInternalListener(knex, 'start', obj => {
    knex.emit('start', obj);
  });
  _addInternalListener(knex, 'query', obj => {
    knex.emit('query', obj);
  });
  _addInternalListener(knex, 'query-error', (err, obj) => {
    knex.emit('query-error', err, obj);
  });
  _addInternalListener(knex, 'query-response', (response, obj, builder) => {
    knex.emit('query-response', response, obj, builder);
  });
}

function _addInternalListener(knex, eventName, listener) {
  knex.client.on(eventName, listener);
  knex._internalListeners.push({
    eventName,
    listener,
  });
}

function createQueryBuilder(knexContext, tableName, options) {
  return knexContext.queryBuilder();
}

function makeKnex(client) {
  // The object we're potentially using to kick off an initial chain.
  function knex(tableName, options) {
    return createQueryBuilder(knex.context, tableName, options);
  }

  redefineProperties(knex, client);

  return knex;
}

module.exports = makeKnex;
