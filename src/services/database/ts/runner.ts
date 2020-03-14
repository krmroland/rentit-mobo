const { assign, isArray } = require('lodash');

import Bluebird from 'bluebird';

// The "Runner" constructor takes a "builder" (query, schema, or raw)
// and runs through each of the query statements, calling any additional
// "output" method provided alongside the query and bindings.
class Runner {
  public client;
  public builder;
  public queries = [];
  public connection;

  constructor(client, builder) {
    this.client = client;
    this.builder = builder;
  }

  // "Run" the target, calling "toSQL" on the builder, returning
  // an object or array of queries to run, each of which are run on
  // a single connection.
  run() {
    return (
      Bluebird.using(this.ensureConnection(), connection => {
        this.connection = connection;

        // this.client.emit('start', this.builder);
        // this.builder.emit('start', this.builder);

        const sql = this.builder.toSQL();

        if (isArray(sql)) {
          return this.queryArray(sql);
        }

        return this.query(sql);
      })

        // If there are any "error" listeners, we fire an error event
        // and then re-throw the error to be eventually handled by
        // the promise chain. Useful if you're wrapping in a custom `Promise`.
        .catch(function(err) {
          // if (this.builder._events && this.builder._events.error) {
          //   this.builder.emit('error', err);
          // }
          throw err;
        })

      // Fire a single "end" event on the builder when
      // all queries have successfully completed.
    );
  }

  // "Runs" a query, returning a promise. All queries specified by the builder are guaranteed
  // to run in sequence, and on the same connection, especially helpful when schema building
  // and dealing with foreign key constraints, etc.
  async query(obj) {
    let queryPromise = this.client.query(this.connection, obj);

    // Await the return value of client.processResponse; in the case of sqlite3's
    // dropColumn()/renameColumn(), it will be a Promise for the transaction
    // containing the complete rename procedure.
    return queryPromise
      .then(resp => this.client.processResponse(resp, this))
      .catch(error => {
        throw error;
      });
  }

  // In the case of the "schema builder" we call `queryArray`, which runs each
  // of the queries in sequence.
  queryArray(queries) {
    return queries.length === 1
      ? this.query(queries[0])
      : Bluebird.bind(this)
          .return(queries)
          .reduce(function(memo, query) {
            return this.query(query).then(function(resp) {
              memo.push(resp);
              return memo;
            });
          }, []);
  }

  // Check whether there's a transaction flag, and that it has a connection.
  ensureConnection() {
    if (this.builder.getConnection()) {
      return Bluebird.resolve(this.builder.getConnection());
    }

    if (this.connection) {
      return Bluebird.resolve(this.connection);
    }
    return this.client.acquireConnection();
  }
}

export default Runner;
