import { assign } from 'lodash';
import assert from 'assert';

const getClauseFromArguments = (...parameters) => {
  let [compilerType, bool, first, operator, second] = parameters;

  let data = null;

  if (typeof first === 'function') {
    data = {
      type: 'onWrapped',
      value: first,
      bool: bool,
    };
  } else {
    switch (parameters.length) {
      case 3: {
        data = { type: 'onRaw', value: first, bool };
        break;
      }
      case 4:
        data = {
          type: compilerType,
          column: first,
          operator: '=',
          value: operator,
          bool,
        };
        break;
      default:
        data = {
          type: compilerType,
          column: first,
          operator,
          value: second,
          bool,
        };
    }
  }

  return data;
};

// JoinClause
// -------

// The "JoinClause" is an object holding any necessary info about a join,
// including the type, and any associated tables & columns being joined.
export default class JoinClause {
  public schema;
  public table;
  public joinType;
  public and;
  public clauses = [];
  public grouping = 'join';
  protected boolFlag;
  protected notFlag;

  constructor(table, type, schema) {
    this.schema = schema;
    this.table = table;
    this.joinType = type;
    this.and = this;
  }
  // Adds an "on" clause to the current join object.
  on(...parameters) {
    let [first] = parameters;

    if (typeof first === 'object' && typeof first.toSQL !== 'function') {
      const keys = Object.keys(first);
      let i = -1;
      const method = this.bool() === 'or' ? 'orOn' : 'on';
      while (++i < keys.length) {
        this[method](keys[i], first[keys[i]]);
      }
      return this;
    }

    const data = getClauseFromArguments('onBasic', this.bool(), ...parameters);

    if (data) {
      this.clauses.push(data);
    }

    return this;
  }
  using(column) {
    return this.clauses.push({ type: 'onUsing', column, bool: this.bool() });
  }
  // Adds an "or on" clause to the current join object.
  orOn(...parameters) {
    let [first, operator, second] = parameters;
    return this.bool('or').on.apply(this, parameters);
  }

  onVal(...parameters) {
    let [first] = parameters;
    if (typeof first === 'object' && typeof first.toSQL !== 'function') {
      const keys = Object.keys(first);
      let i = -1;
      const method = this.bool() === 'or' ? 'orOnVal' : 'onVal';
      while (++i < keys.length) {
        this[method](keys[i], first[keys[i]]);
      }
      return this;
    }

    const data = getClauseFromArguments('onVal', this.bool(), ...parameters);

    if (data) {
      this.clauses.push(data);
    }

    return this;
  }

  andOnVal(...parameters) {
    return this.onVal(...parameters);
  }

  orOnVal(...parameters) {
    return this.bool('or').onVal(...parameters);
  }

  onBetween(column, values) {
    assert(Array.isArray(values), 'The second argument to onBetween must be an array.');
    assert(values.length === 2, 'You must specify 2 values for the onBetween clause');
    this.clauses.push({
      type: 'onBetween',
      column,
      value: values,
      bool: this.bool(),
      not: this.not(),
    });
    return this;
  }

  onNotBetween(column, values) {
    return this.not(true).onBetween(column, values);
  }

  orOnBetween(column, values) {
    return this.bool('or').onBetween(column, values);
  }

  orOnNotBetween(column, values) {
    return this.bool('or')
      .not(true)
      .onBetween(column, values);
  }

  onIn(column, values) {
    if (Array.isArray(values) && values.length === 0) return this.on(1, '=', 0);
    this.clauses.push({
      type: 'onIn',
      column,
      value: values,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  onNotIn(column, values) {
    return this.not(true).onIn(column, values);
  }

  orOnIn(column, values) {
    return this.bool('or').onIn(column, values);
  }

  orOnNotIn(column, values) {
    return this.bool('or')
      .not(true)
      .onIn(column, values);
  }

  onNull(column) {
    this.clauses.push({
      type: 'onNull',
      column,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  orOnNull(callback) {
    return this.bool('or').onNull(callback);
  }

  onNotNull(callback) {
    return this.not(true).onNull(callback);
  }

  orOnNotNull(callback) {
    return this._not(true)
      .bool('or')
      .onNull(callback);
  }

  onExists(callback) {
    this.clauses.push({
      type: 'onExists',
      value: callback,
      not: this.not(),
      bool: this.bool(),
    });
    return this;
  }

  orOnExists(callback) {
    return this.bool('or').onExists(callback);
  }

  onNotExists(callback) {
    return this.not(true).onExists(callback);
  }

  orOnNotExists(callback) {
    return this.not(true)
      .bool('or')
      .onExists(callback);
  }

  // Explicitly set the type of join, useful within a function when creating a grouped join.
  type(type) {
    this.joinType = type;
    return this;
  }

  protected bool(...parameters) {
    let [bool] = parameters;
    if (parameters.length === 1) {
      this.boolFlag = bool;
      return this;
    }
    const ret = this.boolFlag || 'and';
    this.boolFlag = 'and';
    return ret;
  }

  protected not(...parameters) {
    let [val] = parameters;
    if (parameters.length === 1) {
      this.notFlag = val;
      return this;
    }
    const ret = this.notFlag;
    this.notFlag = false;
    return ret;
  }
  get or() {
    return this.bool('or');
  }
}
