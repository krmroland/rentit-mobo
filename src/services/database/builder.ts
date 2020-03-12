import isObjectLike from 'lodash/isObjectLike';
import each from 'lodash/each';
import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';
import isEmpty from 'lodash/isEmpty';
import collect from 'collect.js';
/**
 * Largely inspired by laravel
 * https://laravel.com/
 */
import Grammer from './grammer';

import Connection from './connection';

class Builder {
  protected table: string;

  public bindings = {
    select: [],
    from: [],
    join: [],
    where: [],
    groupBy: [],
    having: [],
    order: [],
  };

  public distinct: boolean = false;

  public joins: Array<any> = [];

  public wheres: Array<any> = [];

  public groups: Array<any> = [];

  public havings: Array<any> = [];

  public orders: Array<any> = [];

  public limit: number | null;

  public offset: number | null;

  protected connection: Connection;
  protected grammer: Grammer;

  constructor(connection: Connection, grammer: Grammer) {
    this.connection = connection;
    this.grammer = grammer;
  }

  from(table: string, alias?: string) {
    this.table = alias ? `${table} as ${alias}` : table;

    return this;
  }

  where(column, operator = null, value = null, boolean = 'and') {
    if (isObjectLike(column)) {
      return this.addObjectOfWheres(column, boolean);
    }

    // Here we will make some assumptions about the operator. If only 2 values are
    // passed to the method, we will assume that the operator is an equals sign
    // and keep going. Otherwise, we'll require the operator to be passed in.
    [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);

    // If the columns is actually a Closure instance, we will assume the developer
    // wants to begin a nested where statement which is wrapped in parenthesis.
    // We'll add that Closure to the query then return back out immediately.
    if (isFunction(column) && isNil(operator)) {
      return this.whereNested(column, boolean);
    }

    // If the given operator is not found in the list of valid operators we will
    // assume that the developer is just short-cutting the '=' operators and
    // we will set the operators to '=' and set the values appropriately.
    if (this.invalidOperator(operator)) {
      [value, operator] = [operator, '='];
    }

    // If the value is "null", we will just assume the developer wants to add a
    // where null clause to the query. So, we will allow a short-cut here to
    // that method for convenience so the developer doesn't have to check.
    if (isNil(value)) {
      return this.whereNull(column, boolean, operator !== '=');
    }

    this.wheres.push({ type: 'Basic', column, operator, value, boolean });

    this.addBinding(value, 'where');

    return this;
  }

  protected addObjectOfWheres(columns, boolean) {
    return this.whereNested(query => {
      each(columns, name => query.where(name, '=', columns[name], boolean));
    }, boolean);
  }

  newQuery() {
    return new Builder(new Connection(), new Grammer()).from(this.table);
  }

  addBinding(value, type = 'where') {
    if (!Object.keys(this.bindings).includes(type)) {
      throw new Error(`Invalid binding type: ${type}.`);
    }

    if (Array.isArray(value)) {
      this.bindings[type].push(...value);
    } else {
      this.bindings[type].push(value);
    }

    return this;
  }

  addNestedWhereQuery(query, boolean = 'and') {
    if (query.wheres.length > 0) {
      this.wheres.push({ type: 'Nested', query, boolean });
      this.addBinding(query.getRawBindings()['where'], 'where');
    }

    return this;
  }

  whereNested(callback: Function, boolean = 'and') {
    const query = this.forNestedWhere();

    callback.prototype.bind(query, [query]);

    return this.addNestedWhereQuery(query, boolean);
  }

  getRawBindings() {
    return this.bindings;
  }

  forNestedWhere() {
    return this.newQuery().from(this.table);
  }

  prepareValueAndOperator(value, operator, useDefaultEquals = false) {
    if (useDefaultEquals) {
      return [operator, '='];
    } else if (this.invalidOperatorAndValue(operator, value)) {
      throw new Error('Illegal operator and value combination.');
    }

    return [value, operator];
  }

  protected invalidOperatorAndValue(operator, value) {
    // avoid using null with wrong operators
    return (
      isNil(value) &&
      this.grammer.operators.includes(opener) &&
      ['=', '<>', '!='].includes(operator)
    );
  }

  /**
   * Determine if the given operator is supported.
   *
   * @param  string  operator
   * @return bool
   */
  protected invalidOperator(operator) {
    return !this.grammer.operators.includes(operator);
  }

  whereNull(columns, boolean = 'and', not = false) {
    const type = not ? 'NotNull' : 'Null';

    (Array.isArray(columns) ? columns : [columns]).forEach(column => {
      this.wheres.push({ type, column, boolean });
    });

    return this;
  }

  insert(values) {
    // Since every insert gets treated like a batch insert, we will make sure the
    // bindings are structured in a way that is convenient when building these
    // inserts statements by verifying these elements are actually an array.
    if (isEmpty(values)) {
      return true;
    }

    if (!Array.isArray(values)) {
      values = [Object.values(values)];
    }

    //  sot the object keys
    else {
      values = values.map(item => {
        const result = [];
        Object.keys(item)
          .sort()
          .forEach(key => {
            result.push(item[key]);
          });
        return result;
      });
    }

    // Finally, we will run this query against the database connection and return
    // the results. We will need to also flatten these bindings before running
    // the query so they are all in one huge, flattened array for execution.
    return this.connection.insert(
      this.grammer.compileInsert(this, values),

      collect(values)
        .faltten(1)
        .all(),
    );
  }
}
