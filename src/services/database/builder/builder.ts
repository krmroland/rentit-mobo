import {
  castArray,
  isPlainObject,
  isObject,
  isFunction,
  isEmpty,
  clone,
  flatten,
  pick,
} from 'lodash';

import Compiler from './compiler';

class Builder {
  /**
   * The database connection
   * @type {[type]}
   */
  public database;
  /**
   * The where clauses
   * @type {Array}
   */
  public wheres = [];
  /**
   * The agregate values
   * @type {Object|null}
   */
  public aggregateValue: object | null;
  /**
   * The sequel groups
   * @type {[type]}
   */
  public groups: Array<any> | string;
  /**
   * The orders on the query
   * @type {Array|string}
   */
  public orders: Array<object> = [];
  /**
   * The selected cokumns
   * @type {Array}
   */
  public columns: Array<object> | null = null;
  /**
   * The query bindings
   * @type {Object}
   */
  public bindings = {
    where: [],
    limit: [],
    orderBy: [],
    groupBy: [],
  };
  /**
   * The number of items to skip
   * @type {[type]}
   */
  public offsetValue: number | null;
  /**
   * The number of items to return
   * @type {[type]}
   */
  public limitValue: number | null;
  /**
   * Filters distinct values
   * @type {boolean}
   */
  public distinctValue: boolean = false;

  /**
   * The sql compiler
   * @type {[type]}
   */
  public compiler;
  /**
   * The table to compile from
   * We are using a single table (noSql)
   * @type {[type]}
   */
  public fromTable = 'documents';
  /**
   * The query result handler
   * @type {Function|null}
   */
  protected _resultsHandler: Function | null;

  /**
   * Creates an instance of the class
   */
  constructor(compiler: Compiler = null, database = null) {
    this.database = database;
    this.compiler = compiler;
  }
  /**
   * Adds a where null clause to the query
   * @param {[type]}  column
   * @param {Boolean} isNull =
   */
  whereNull(column, boolean = 'and') {
    this.wheres.push({ column, type: 'Nullable', boolean });
    return this;
  }
  /**
   * Adds a limit to the query
   * @param {number} limit
   */
  limit(limit: number) {
    this.limitValue = limit;
    return this;
  }
  /**
   * Selects distinct values
   * @param {Boolean} value = true
   */
  distinct(value: boolean = true) {
    this.distinctValue = value;
    return this;
  }
  /**
   * Offsets a given number of rows
   * @param {number} value
   */
  skip(value) {
    this.offsetValue = value;
    return this;
  }

  /**
   * Offsets a given number of rows
   * @param {number} value
   */
  offset(value) {
    return this.limit(value);
  }
  /**
   * The generic where method
   * @param {Array} ...parameters
   */
  where(...parameters) {
    return this.parseWhere('Basic', ...parameters);
  }

  orderBy(column, direction = 'asc') {
    direction = String(direction).toLowerCase();

    if (!['asc', 'desc'].includes(direction)) {
      throw new Error('Order direction must be "asc" or "desc".');
    }

    this.orders.push({ column, direction });

    return this;
  }

  /**
     * Add an "order by" clause for a timestamp to the query.
  
     */
  latest(column = 'created_at') {
    return this.orderBy(column, 'desc');
  }

  /**
   * Performs a where clasuse
   * @param {Array<string>} ...parameters
   */
  protected parseWhere(type, ...parameters) {
    let [column, operator, value, boolean = 'and'] = parameters;

    if (isObject(column)) {
      return this.whereObject(column, type);
    }

    // Enable the where('key', value) syntax, only when there
    // are explicitly two arguments passed, so it's not possible to
    // do where('key', '!=') and have that turn into where key != null
    if (parameters.length === 2) {
      value = operator;
      operator = '=';

      // If the value is null, and it's a two argument query,
      // we assume we're going for a `whereNull`.
      if (value === null) {
        return this.whereNull(column, boolean);
      }
    }

    return this.addWhere(column, operator, value, boolean, type);
  }
  // Processes an object literal provided in a "where" clause.
  protected whereObject(object, type = 'basic', boolean = 'and') {
    Object.keys(object).forEach(column => {
      this.addWhere(column, '=', object[column], boolean, type);
    });

    return this;
  }

  /**
   * Adds a where command
   * @param {string} column
   * @param {string} operator
   * @param {mixed} value
   * @param {string} boolean
   * @param {string} type
   */
  protected addWhere(column, operator, value, boolean = 'and', type = 'basic') {
    this.wheres.push({ type, column, operator, boolean });
    this.bindings.where.push(value);

    return this;
  }
  /**
   * Adds a where data clause to the builder
   * @param {Array} ...parameters
   */
  protected whereData(...parameters) {
    return this.parseWhere('DataColumn', ...parameters);
  }

  select(...parameters) {
    let [columns] = parameters;

    //this.columns = []; // will mostly be used for sub-queries

    this.columns = Array.isArray(columns) ? columns : parameters;

    return this;
  }

  /**
   * Retrieve the "count" result of the query.
   *
   * @param  string  $columns
   * @return int
   */
  count(columns = '*') {
    return +this.aggregate('count', castArray(columns));
  }
  /**
   * Runs an aggregate query
   * @param {[type]} name    [description]
   * @param {[type]} columns [description]
   */
  aggregate(name, columns) {
    let results = this.cloneWithout(['columns'])
      .cloneWithoutBindings(['select'])
      .setAggregate(name, columns)
      .get(columns)
      .base();

    if (!results.isEmpty()) {
      return results[0]['aggregate'];
    }
  }

  /**
   * Clone the query without the given properties.
   */
  cloneWithout(properties) {
    const $clone = clone(this);

    castArray(properties).forEach(property => {
      $clone[property] = null;
    });

    return $clone;
  }

  cloneWithoutBindings(bindings) {
    const $clone = clone(this);

    castArray(bindings).forEach(prop => ($clone.bindings[prop] = []));

    return $clone;
  }

  /**
   * Set the aggregate property without running the query.
   * @return $this
   */
  protected setAggregate(name, columns) {
    this.aggregateValue = { name, columns };

    if (isEmpty(this.groups)) {
      this.orders = [];

      this.bindings.orderBy = [];
    }

    return this;
  }

  get(columns = ['*']) {
    if (!this.database) {
      console.warn('Missing database from the query builder');
      return;
    }

    this.select(columns);

    return this.database.executeSql(this.toSql(), this.getBindings()).then(results => {
      return Promise.resolve(this._resultsHandler ? this._resultsHandler(results) : results);
    });
  }

  resultsHandler(callback: Function) {
    if (!isFunction(callback)) {
      throw new Error(
        `resultHandler callback must be a function, type:${typeof callback} received`,
      );
    }
    this._resultsHandler = callback;

    return this;
  }

  /**
   * Get the SQL representation of the query.
   */
  toSql() {
    return this.compiler.compileSelect(this);
  }

  from(table) {
    this.fromTable = table;
    return this;
  }

  /**
   * Get the current query value bindings in a flattened array.
   *
   * @return array
   */
  getBindings() {
    return flatten(Object.values(this.bindings));
  }

  /**
   * Insert a new record into the database.
   */
  insert(values: Array<any> | object) {
    // Since every insert gets treated like a batch insert, we will make sure the
    // bindings are structured in a way that is convenient when building these
    // inserts statements by verifying these elements are actually an array.
    if (isEmpty(values)) {
      return true;
    }

    if (!isPlainObject(values[0])) {
      values = [values];
    }

    // Here, we will sort the insert keys for every record so that each insert is
    // in the same order for the record. We need to make sure this is the case
    // so there are not any errors or problems when inserting these records.
    else {
      const keys = Object.keys(values[0]).sort();

      values = values.map(value => pick(value, keys));
    }

    // Finally, we will run this query against the database connection and return
    // the results. We will need to also flatten these bindings before running
    // the query so they are all in one huge, flattened array for execution.
    return this.database.insert(
      this.compiler.compileInsert(this, values),
      flatten(values.map(v => Object.values(v))),
    );
  }

  protected isQueryable(value) {
    return value instanceof Builder || isFunction(value);
  }
}

export default Builder;
