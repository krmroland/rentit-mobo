import assert from 'assert';
import interface from '../interface';

import * as helpers from '../utils/helpers';

import {
  assign,
  clone,
  each,
  isBoolean,
  isEmpty,
  isFunction,
  isNumber,
  isObject,
  isString,
  isUndefined,
  tail,
  toArray,
  reject,
  map,
  includes,
} from 'lodash';

const Raw = require('../raw');

const JoinClause = require('./joinclause');

class Builder {
  public and: Builder;
  public client;
  public single: object = {};
  public statements: Array<any> = [];
  public method: string = 'select';

  protected joinFlag = 'inner';
  protected boolFlag = 'and';
  protected notFlag = false;
  protected asColumnFlag = false;
  protected connection;
  protected options;
  protected _queryContext;

  constructor(client) {
    this.client = client;
    this.and = this;
  }

  protected validateWithArgs(alias, statement, method) {
    if (typeof alias !== 'string') {
      throw new Error(`${method}() first argument must be a string`);
    }
    if (
      typeof statement === 'function' ||
      statement instanceof Builder ||
      statement instanceof Raw
    ) {
      return;
    }
    throw new Error(`${method}() second argument must be a function / QueryBuilder or a raw`);
  }

  toString() {
    return this.toQuery();
  }

  toQuery(tz?) {
    let data = this.toSQL(this.method, tz);
    if (!Array.isArray(data)) {
      data = [data];
    }
    return map(data, statement => {
      return this.client._formatQuery(statement.sql, statement.bindings, tz);
    }).join(';\n');
  }

  // Convert the current query "toSQL"
  toSQL(method, tz) {
    return this.client.queryCompiler(this).toSQL(method || this.method, tz);
  }

  // Create a shallow clone of the current query builder.
  clone() {
    const cloned = new Builder(this.client);
    cloned.method = this.method;
    cloned.single = clone(this.single);
    cloned.statements = clone(this.statements);
    // `_option` is assigned by the `Interface` mixin.
    if (!isUndefined(this.options)) {
      cloned.options = clone(this.options);
    }
    if (!isUndefined(this.queryContext)) {
      cloned.queryContext = clone(this.queryContext);
    }
    if (!isUndefined(this.connection)) {
      cloned.connection = this.connection;
    }

    return cloned;
  }

  with(alias, statement) {
    this.validateWithArgs(alias, statement, 'with');
    return this.withWrapped(alias, statement);
  }

  // Helper for compiling any advanced `with` queries.
  withWrapped(alias, query) {
    this.statements.push({
      grouping: 'with',
      type: 'withWrapped',
      alias: alias,
      value: query,
    });
    return this;
  }

  // With Recursive
  // ------

  withRecursive(alias, statement) {
    this.validateWithArgs(alias, statement, 'withRecursive');
    return this.withRecursiveWrapped(alias, statement);
  }

  // Helper for compiling any advanced `withRecursive` queries.
  withRecursiveWrapped(alias, query) {
    this.withWrapped(alias, query);
    this.statements[this.statements.length - 1].recursive = true;
    return this;
  }

  // Select
  // ------

  // Adds a column or columns to the list of "columns"
  // being selected on the query.
  columns(...args) {
    const column = args[0];

    if (!column && column !== 0) {
      return this;
    }

    this.statements.push({
      grouping: 'columns',
      value: helpers.normalizeArr.apply(null, args),
    });

    return this;
  }
  // Allow for a sub-select to be explicitly aliased as a column,
  // without needing to compile the query in a where.
  as(column) {
    this.single.as = column;
    return this;
  }
  // Prepends the `schemaName` on `tableName` defined by `.table` and `.join`.
  withSchema(schemaName) {
    this.single.schema = schemaName;
    return this;
  }
  // Sets the `tableName` on the query.
  // Alias to "from" for select and "into" for insert statements
  // e.g. builder.insert({a: value}).into('tableName')
  // `options`: options object containing keys:
  //   - `only`: whether the query should use SQL's ONLY to not return
  //           inheriting table data. Defaults to false.
  table(tableName, options = {}) {
    this.single.table = tableName;
    this.single.only = options.only === true;
    return this;
  }

  // Adds a `distinct` clause to the query.
  distinct(...args) {
    this.statements.push({
      grouping: 'columns',
      value: helpers.normalizeArr.apply(null, args),
      distinct: true,
    });
    return this;
  }
  // Adds a join clause to the query, allowing for advanced joins
  // with an anonymous function as the second argument.
  // function(table, first, operator, second)
  join(...args) {
    const [table, first] = args;
    let join;
    const { schema } = this.single;
    const joinType = this.joinType();
    if (typeof first === 'function') {
      join = new JoinClause(table, joinType, schema);
      first.call(join, join);
    } else if (joinType === 'raw') {
      join = new JoinClause(this.client.raw(table, first), 'raw');
    } else {
      join = new JoinClause(table, joinType, table instanceof Builder ? undefined : schema);
      if (args.length > 1) {
        join.on.apply(join, toArray(args).slice(1));
      }
    }
    this.statements.push(join);
    return this;
  }

  // JOIN blocks:
  innerJoin(...parameters) {
    return this.joinType('inner').join.apply(this, parameters);
  }
  leftJoin(...parameters) {
    return this.joinType('left').join.apply(this, parameters);
  }
  leftOuterJoin(...parameters) {
    return this.joinType('left outer').join.apply(this, parameters);
  }
  rightJoin(...parameters) {
    return this.joinType('right').join.apply(this, parameters);
  }
  rightOuterJoin(...parameters) {
    return this.joinType('right outer').join.apply(this, parameters);
  }
  outerJoin(...parameters) {
    return this.joinType('outer').join.apply(this, parameters);
  }
  fullOuterJoin(...parameters) {
    return this.joinType('full outer').join.apply(this, parameters);
  }
  crossJoin(...parameters) {
    return this.joinType('cross').join.apply(this, parameters);
  }
  joinRaw(...parameters) {
    return this.joinType('raw').join.apply(this, parameters);
  }

  protected joinType(...parameters) {
    const [value] = parameters;
    if (parameters.length === 1) {
      this.joinFlag = value;
      return this;
    }
    const ret = this.joinFlag || 'inner';
    this.joinFlag = 'inner';
    return ret;
  }

  // The where function can be used in several ways:
  // The most basic is `where(key, value)`, which expands to
  // where key = value.
  where(...parameters) {
    let [column, operator, value] = parameters;
    // Support "where true || where false"
    if (column === false || column === true) {
      return this.where(1, '=', column ? 1 : 0);
    }

    // Check if the column is a function, in which case it's
    // a where statement wrapped in parens.
    if (typeof column === 'function') {
      return this.whereWrapped(column);
    }

    // Allow a raw statement to be passed along to the query.
    if (column instanceof Raw && parameters.length === 1) {
      return this.whereRaw(column);
    }

    // Allows `where({id: 2})` syntax.
    if (isObject(column) && !(column instanceof Raw)) {
      return this.objectWhere(column);
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
        return this.whereNull(column);
      }
    }

    // lower case the operator for comparison purposes
    const checkOperator = String(operator)
      .toLowerCase()
      .trim();

    // If there are 3 arguments, check whether 'in' is one of them.
    if (parameters.length === 3) {
      if (checkOperator === 'in' || checkOperator === 'not in') {
        return this.not(checkOperator === 'not in').whereIn(parameters[0], parameters[2]);
      }
      if (checkOperator === 'between' || checkOperator === 'not between') {
        return this.not(checkOperator === 'not between').whereBetween(parameters[0], parameters[2]);
      }
    }

    // If the value is still null, check whether they're meaning
    // where value is null
    if (value === null) {
      // Check for .where(key, 'is', null) or .where(key, 'is not', 'null');
      if (checkOperator === 'is' || checkOperator === 'is not') {
        return this.not(checkOperator === 'is not').whereNull(column);
      }
    }

    // Push onto the where statement stack.
    this.statements.push({
      grouping: 'where',
      type: 'whereBasic',
      column,
      operator,
      value,
      not: this.not(),
      bool: this.bool(),
      asColumn: this.asColumnFlag,
    });
    return this;
  }

  whereColumn(...parameters) {
    this.asColumnFlag = true;
    this.where.apply(this, parameters);
    this.asColumnFlag = false;
    return this;
  }

  // Adds an `or where` clause to the query.
  orWhere(...parameters) {
    this.bool('or');
    const obj = parameters[0];
    if (isObject(obj) && !isFunction(obj) && !(obj instanceof Raw)) {
      return this.whereWrapped(function() {
        for (const key in obj) {
          this.andWhere(key, obj[key]);
        }
      });
    }
    return this.where.apply(this, parameters);
  }

  orWhereColumn(...parameters) {
    this.bool('or');
    const obj = parameters[0];
    if (isObject(obj) && !isFunction(obj) && !(obj instanceof Raw)) {
      return this.whereWrapped(function() {
        for (const key in obj) {
          this.andWhereColumn(key, '=', obj[key]);
        }
      });
    }
    return this.whereColumn.apply(this, parameters);
  }

  // Adds an `not where` clause to the query.
  whereNot(...parameters) {
    return this.not(true).where.apply(this, parameters);
  }

  whereNotColumn(...parameters) {
    return this.not(true).whereColumn.apply(this, parameters);
  }

  // Adds an `or not where` clause to the query.
  orWhereNot(...parameters) {
    return this.bool('or').whereNot.apply(this, parameters);
  }

  orWhereNotColumn(...parameters) {
    return this.bool('or').whereNotColumn.apply(this, parameters);
  }

  // Processes an object literal provided in a "where" clause.
  protected objectWhere(obj) {
    const boolVal = this.bool();
    const notVal = this.not() ? 'Not' : '';
    for (const key in obj) {
      this[boolVal + 'Where' + notVal](key, obj[key]);
    }
    return this;
  }

  // Adds a raw `where` clause to the query.
  whereRaw(sql, bindings = []) {
    const raw = sql instanceof Raw ? sql : this.client.raw(sql, bindings);
    this.statements.push({
      grouping: 'where',
      type: 'whereRaw',
      value: raw,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  orWhereRaw(sql, bindings) {
    return this.bool('or').whereRaw(sql, bindings);
  }

  // Helper for compiling any advanced `where` queries.
  whereWrapped(callback) {
    this.statements.push({
      grouping: 'where',
      type: 'whereWrapped',
      value: callback,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  // Adds a `where exists` clause to the query.
  whereExists(callback) {
    this.statements.push({
      grouping: 'where',
      type: 'whereExists',
      value: callback,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  // Adds an `or where exists` clause to the query.
  orWhereExists(callback) {
    return this.bool('or').whereExists(callback);
  }

  // Adds a `where not exists` clause to the query.
  whereNotExists(callback) {
    return this.not(true).whereExists(callback);
  }

  // Adds a `or where not exists` clause to the query.
  orWhereNotExists(callback) {
    return this.bool('or').whereNotExists(callback);
  }

  // Adds a `where in` clause to the query.
  whereIn(column, values) {
    if (Array.isArray(values) && isEmpty(values)) {
      return this.where(this.not());
    }
    this.statements.push({
      grouping: 'where',
      type: 'whereIn',
      column,
      value: values,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  // Adds a `or where in` clause to the query.
  orWhereIn(column, values) {
    return this.bool('or').whereIn(column, values);
  }

  // Adds a `where not in` clause to the query.
  whereNotIn(column, values) {
    return this.not(true).whereIn(column, values);
  }

  // Adds a `or where not in` clause to the query.
  orWhereNotIn(column, values) {
    return this.bool('or')
      .not(true)
      .whereIn(column, values);
  }

  // Adds a `where null` clause to the query.
  whereNull(column) {
    this.statements.push({
      grouping: 'where',
      type: 'whereNull',
      column,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  // Adds a `or where null` clause to the query.
  orWhereNull(column) {
    return this.bool('or').whereNull(column);
  }

  // Adds a `where not null` clause to the query.
  whereNotNull(column) {
    return this.not(true).whereNull(column);
  }

  // Adds a `or where not null` clause to the query.
  orWhereNotNull(column) {
    return this.bool('or').whereNotNull(column);
  }

  // Adds a `where between` clause to the query.
  whereBetween(column, values) {
    assert(Array.isArray(values), 'The second argument to whereBetween must be an array.');
    assert(values.length === 2, 'You must specify 2 values for the whereBetween clause');

    this.statements.push({
      grouping: 'where',
      type: 'whereBetween',
      column,
      value: values,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  // Adds a `where not between` clause to the query.
  whereNotBetween(column, values) {
    return this.not(true).whereBetween(column, values);
  }

  // Adds a `or where between` clause to the query.
  orWhereBetween(column, values) {
    return this.bool('or').whereBetween(column, values);
  }

  // Adds a `or where not between` clause to the query.
  orWhereNotBetween(column, values) {
    return this.bool('or').whereNotBetween(column, values);
  }

  // Adds a `group by` clause to the query.
  groupBy(...parameters) {
    const [item] = parameters;

    if (item instanceof Raw) {
      return this.groupByRaw.apply(this, parameters);
    }
    this.statements.push({
      grouping: 'group',
      type: 'groupByBasic',
      value: helpers.normalizeArr.apply(null, parameters),
    });
    return this;
  }

  // Adds a raw `group by` clause to the query.
  groupByRaw(sql, bindings) {
    const raw = sql instanceof Raw ? sql : this.client.raw(sql, bindings);
    this.statements.push({
      grouping: 'group',
      type: 'groupByRaw',
      value: raw,
    });
    return this;
  }

  // Adds a `order by` clause to the query.
  orderBy(column, direction) {
    if (Array.isArray(column)) {
      return this.orderByArray(column);
    }
    this.statements.push({
      grouping: 'order',
      type: 'orderByBasic',
      value: column,
      direction,
    });
    return this;
  }

  // Adds a `order by` with multiple columns to the query.
  protected orderByArray(columnDefs) {
    for (let i = 0; i < columnDefs.length; i++) {
      const columnInfo = columnDefs[i];
      if (isObject(columnInfo)) {
        this.statements.push({
          grouping: 'order',
          type: 'orderByBasic',
          value: columnInfo['column'],
          direction: columnInfo['order'],
        });
      } else if (isString(columnInfo)) {
        this.statements.push({
          grouping: 'order',
          type: 'orderByBasic',
          value: columnInfo,
        });
      }
    }
    return this;
  }

  // Add a raw `order by` clause to the query.
  orderByRaw(sql, bindings) {
    const raw = sql instanceof Raw ? sql : this.client.raw(sql, bindings);
    this.statements.push({
      grouping: 'order',
      type: 'orderByRaw',
      value: raw,
    });
    return this;
  }

  protected makeUnion(clause, args) {
    let callbacks = args[0];
    let wrap = args[1];
    if (args.length === 1 || (args.length === 2 && isBoolean(wrap))) {
      if (!Array.isArray(callbacks)) {
        callbacks = [callbacks];
      }
      for (let i = 0, l = callbacks.length; i < l; i++) {
        this.statements.push({
          grouping: 'union',
          clause: clause,
          value: callbacks[i],
          wrap: wrap || false,
        });
      }
    } else {
      callbacks = toArray(args).slice(0, args.length - 1);
      wrap = args[args.length - 1];
      if (!isBoolean(wrap)) {
        callbacks.push(wrap);
        wrap = false;
      }
      this.makeUnion(clause, [callbacks, wrap]);
    }
    return this;
  }

  // Add a union statement to the query.
  union(...args) {
    return this.makeUnion('union', args);
  }

  // Adds a union all statement to the query.
  unionAll(...args) {
    return this.makeUnion('union all', args);
  }

  // Adds an intersect statement to the query
  intersect(...parameters) {
    let [callbacks, wrap] = parameters;
    if (parameters.length === 1 || (parameters.length === 2 && isBoolean(wrap))) {
      if (!Array.isArray(callbacks)) {
        callbacks = [callbacks];
      }
      for (let i = 0, l = callbacks.length; i < l; i++) {
        this.statements.push({
          grouping: 'union',
          clause: 'intersect',
          value: callbacks[i],
          wrap: wrap || false,
        });
      }
    } else {
      callbacks = toArray(parameters).slice(0, parameters.length - 1);
      wrap = parameters[parameters.length - 1];
      if (!isBoolean(wrap)) {
        callbacks.push(wrap);
        wrap = false;
      }
      this.intersect(callbacks, wrap);
    }
    return this;
  }

  // Adds a `having` clause to the query.
  having(...parameters) {
    let [column, operator, value] = parameters;
    if (column instanceof Raw && parameters.length === 1) {
      return this.havingRaw(column);
    }

    // Check if the column is a function, in which case it's
    // a having statement wrapped in parens.
    if (typeof column === 'function') {
      return this.havingWrapped(column);
    }

    this.statements.push({
      grouping: 'having',
      type: 'havingBasic',
      column,
      operator,
      value,
      bool: this.bool(),
      not: this.not(),
    });
    return this;
  }

  orHaving(...parameters) {
    this.bool('or');
    const obj = parameters[0];
    if (isObject(obj) && !isFunction(obj) && !(obj instanceof Raw)) {
      return this.havingWrapped(function() {
        for (const key in obj) {
          this.andHaving(key, obj[key]);
        }
      });
    }
    return this.having(this, parameters);
  }

  // Helper for compiling any advanced `having` queries.
  havingWrapped(callback) {
    this.statements.push({
      grouping: 'having',
      type: 'havingWrapped',
      value: callback,
      bool: this.bool(),
      not: this.not(),
    });
    return this;
  }

  havingNull(column) {
    this.statements.push({
      grouping: 'having',
      type: 'havingNull',
      column,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  orHavingNull(callback) {
    return this.bool('or').havingNull(callback);
  }

  havingNotNull(callback) {
    return this.not(true).havingNull(callback);
  }

  orHavingNotNull(callback) {
    return this.not(true)
      .bool('or')
      .havingNull(callback);
  }

  havingExists(callback) {
    this.statements.push({
      grouping: 'having',
      type: 'havingExists',
      value: callback,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  orHavingExists(callback) {
    return this.bool('or').havingExists(callback);
  }

  havingNotExists(callback) {
    return this.not(true).havingExists(callback);
  }

  orHavingNotExists(callback) {
    return this.not(true)
      .bool('or')
      .havingExists(callback);
  }

  havingBetween(column, values) {
    assert(Array.isArray(values), 'The second argument to havingBetween must be an array.');
    assert(values.length === 2, 'You must specify 2 values for the havingBetween clause');
    this.statements.push({
      grouping: 'having',
      type: 'havingBetween',
      column,
      value: values,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  orHavingBetween(column, values) {
    return this.bool('or').havingBetween(column, values);
  }

  havingNotBetween(column, values) {
    return this.not(true).havingBetween(column, values);
  }

  orHavingNotBetween(column, values) {
    return this.not(true)
      .bool('or')
      .havingBetween(column, values);
  }

  havingIn(column, values) {
    if (Array.isArray(values) && isEmpty(values)) {
      return this.where(this.not());
    }
    this.statements.push({
      grouping: 'having',
      type: 'havingIn',
      column,
      value: values,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }
  // Adds a `or where in` clause to the query.
  orHavingIn(column, values) {
    return this.bool('or').havingIn(column, values);
  }
  // Adds a `where not in` clause to the query.
  havingNotIn(column, values) {
    return this.not(true).havingIn(column, values);
  }
  // Adds a `or where not in` clause to the query.
  orHavingNotIn(column, values) {
    return this.bool('or')
      .not(true)
      .havingIn(column, values);
  }
  // Adds a raw `having` clause to the query.
  havingRaw(sql, bindings = []) {
    const raw = sql instanceof Raw ? sql : this.client.raw(sql, bindings);
    this.statements.push({
      grouping: 'having',
      type: 'havingRaw',
      value: raw,
      bool: this.bool(),
      not: this.not(),
    });
    return this;
  }
  orHavingRaw(sql, bindings) {
    return this.bool('or').havingRaw(sql, bindings);
  }
  // Only allow a single "offset" to be set for the current query.
  offset(value) {
    this.single.offset = value;
    return this;
  }

  // Only allow a single "limit" to be set for the current query.
  limit(value) {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      this.client.logger.warn('A valid integer must be provided to limit');
    } else {
      this.single.limit = val;
    }
    return this;
  }
  // Retrieve the "count" result of the query.
  count(column) {
    return this.aggregate('count', column || '*');
  }
  // Retrieve the minimum value of a given column.
  min(column) {
    return this.aggregate('min', column);
  }
  // Retrieve the maximum value of a given column.
  max(column) {
    return this.aggregate('max', column);
  }
  // Retrieve the sum of the values of a given column.
  sum(column) {
    return this.aggregate('sum', column);
  }
  // Retrieve the average of the values of a given column.
  avg(column) {
    return this.aggregate('avg', column);
  }
  // Retrieve the "count" of the distinct results of the query.
  countDistinct(...parameters) {
    let columns: Array<string> | string = helpers.normalizeArr(null, parameters);

    if (!columns.length) {
      columns = '*';
    } else if (columns.length === 1) {
      columns = columns[0];
    }

    return this.aggregate('count', columns, true);
  }
  // Retrieve the sum of the distinct values of a given column.
  sumDistinct(column) {
    return this.aggregate('sum', column, true);
  }
  // Retrieve the vg of the distinct results of the query.
  avgDistinct(column) {
    return this.aggregate('avg', column, true);
  }
  // Increments a column's value by the specified amount.
  increment(column, amount = 1) {
    if (isObject(column)) {
      for (const key in column) {
        this.makecounter(key, column[key]);
      }

      return this;
    }

    return this.makecounter(column, amount);
  }
  // Decrements a column's value by the specified amount.
  decrement(column, amount = 1) {
    if (isObject(column)) {
      for (const key in column) {
        this.makecounter(key, -column[key]);
      }

      return this;
    }

    return this.makecounter(column, -amount);
  }
  // Clears increments/decrements
  clearCounters() {
    this.single.counter = {};

    return this;
  }
  // Sets the values for a `select` query, informing that only the first
  // row should be returned (limit 1).
  first(...parameters) {
    if (!includes(['pluck', 'first', 'select'], this.method)) {
      throw new Error(`Cannot chain .first() on "${this.method}" query!`);
    }

    const args = new Array(parameters.length);
    for (let i = 0; i < args.length; i++) {
      args[i] = parameters[i];
    }
    this.select.apply(this, args);
    this.method = 'first';
    this.limit(1);
    return this;
  }
  // Use existing connection to execute the query
  // Same value that client.acquireConnection() for an according client returns should be passed
  getConnection() {
    return this.connection;
  }
  // Pluck a column from a query.
  pluck(column) {
    this.method = 'pluck';
    this.single.pluck = column;
    this.statements.push({
      grouping: 'columns',
      type: 'pluck',
      value: column,
    });
    return this;
  }

  // Remove everything from select clause
  clearSelect() {
    this.clearGrouping('columns');
    return this;
  }

  // Remove everything from where clause
  clearWhere() {
    this.clearGrouping('where');
    return this;
  }

  // Remove everything from order clause
  clearOrder() {
    this.clearGrouping('order');
    return this;
  }

  // Remove everything from having clause
  clearHaving() {
    this.clearGrouping('having');
    return this;
  }

  // Insert & Update
  // ------

  // Sets the values for an `insert` query.
  insert(values, returning) {
    this.method = 'insert';
    if (!isEmpty(returning)) {
      this.returning(returning);
    }
    this.single.insert = values;
    return this;
  }

  // Sets the values for an `update`, allowing for both
  // `.update(key, value, [returning])` and `.update(obj, [returning])` syntaxes.
  update(...parameters) {
    const [values, returning] = parameters;
    let ret;
    const obj = this.single.update || {};
    this.method = 'update';
    if (isString(values)) {
      obj[values] = returning;
      if (parameters.length > 2) {
        ret = parameters[2];
      }
    } else {
      const keys = Object.keys(values);
      if (this.single.update) {
        this.client.logger.warn('Update called multiple times with objects.');
      }
      let i = -1;
      while (++i < keys.length) {
        obj[keys[i]] = values[keys[i]];
      }
      ret = parameters[1];
    }
    if (!isEmpty(ret)) this.returning(ret);
    this.single.update = obj;
    return this;
  }

  // Sets the returning value for the query.
  returning(returning) {
    this.single.returning = returning;
    return this;
  }

  // Delete
  // ------

  // Executes a delete statement on the query;
  delete(ret) {
    this.method = 'del';
    if (!isEmpty(ret)) {
      this.returning(ret);
    }
    return this;
  }

  // Truncates a table, ends the query chain.
  truncate(tableName) {
    this.method = 'truncate';
    if (tableName) {
      this.single.table = tableName;
    }
    return this;
  }

  // Retrieves columns for the table specified by `knex(tableName)`
  columnInfo(column) {
    this.method = 'columnInfo';
    this.single.columnInfo = column;
    return this;
  }

  // Set a lock for update constraint.
  forUpdate() {
    this.single.lock = 'forUpdate';
    this.single.lockTables = helpers.normalizeArr.apply(null, arguments);
    return this;
  }

  // Set a lock for share constraint.
  forShare(...parameters) {
    this.single.lock = 'forShare';
    this.single.lockTables = helpers.normalizeArr.apply(null, parameters);
    return this;
  }

  // Takes a JS object of methods to call and calls them
  fromJS(obj) {
    each(obj, (val, key) => {
      if (typeof this[key] !== 'function') {
        this.client.logger.warn(`Builder Error: unknown key ${key}`);
      }
      if (Array.isArray(val)) {
        this[key].apply(this, val);
      } else {
        this[key](val);
      }
    });
    return this;
  }

  // Passes query to provided callback function, useful for e.g. composing
  // domain-specific helpers
  modify(...parameters) {
    const [callback] = parameters;
    callback.apply(this, [this].concat(tail(parameters)));
    return this;
  }

  // ----------------------------------------------------------------------

  // Helper for the incrementing/decrementing queries.
  protected makecounter(column, amount) {
    amount = parseFloat(amount);

    this.method = 'update';

    this.single.counter = this.single.counter || {};

    this.single.counter[column] = amount;

    return this;
  }

  // Helper to get or set the "boolFlag" value.
  protected bool(...parameters) {
    const [value] = parameters;
    if (parameters.length === 1) {
      this.boolFlag = val;
      return this;
    }
    const ret = this.boolFlag;
    this.boolFlag = 'and';
    return ret;
  }

  // Helper to get or set the "notFlag" value.
  protected not(...parameters) {
    const [val] = parameters;
    if (parameters.length === 1) {
      this.notFlag = val;
      return this;
    }
    const ret = this.notFlag;
    this.notFlag = false;
    return ret;
  }

  // Helper for compiling any aggregate queries.
  protected aggregate(method, column, aggregateDistinct = false) {
    this.statements.push({
      grouping: 'columns',
      type: column instanceof Raw ? 'aggregateRaw' : 'aggregate',
      method,
      value: column,
      aggregateDistinct: aggregateDistinct,
    });
    return this;
  }

  // Helper function for clearing or reseting a grouping type from the builder
  protected clearGrouping(grouping) {
    this.statements = reject(this.statements, { grouping });
  }
  get or() {
    return this.bool('or');
  }

  select(...args) {
    return this.columns(...args);
  }

  queryContext(context) {
    if (isUndefined(context)) {
      return this._queryContext;
    }
    this._queryContext = context;

    return this;
  }

  get(...parameters) {
    return this.then(...parameters);
  }

  then(...parameters) {
    let result = this.client.runner(this).run();

    return result.then.apply(result, parameters);
  }
}

export default Builder;
