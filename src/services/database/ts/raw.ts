import * as helpers from './utils/helpers';

const { assign, reduce, isPlainObject, isObject, isUndefined, isNumber } = require('lodash');

const uuid = require('uuid');

import debug from 'debug';

const debugBindings = debug('query:bindings');

const replaceKeyBindings = (raw, formatter) => {
  const values = raw.bindings;
  const regex = /\\?(:(\w+):(?=::)|:(\w+):(?!:)|:(\w+))/g;

  const sql = raw.sql.replace(regex, function(match, p1, p2, p3, p4) {
    if (match !== p1) {
      return p1;
    }

    const part = p2 || p3 || p4;
    const key = match.trim();
    const isIdentifier = key[key.length - 1] === ':';
    const value = values[part];

    if (value === undefined) {
      if (Object.prototype.hasOwnProperty.call(values, part)) {
        formatter.bindings.push(value);
      }

      return match;
    }

    if (isIdentifier) {
      return match.replace(p1, formatter.columnize(value));
    }

    return match.replace(p1, formatter.parameter(value));
  });

  return {
    method: 'raw',
    sql,
    bindings: formatter.bindings,
  };
};

function replaceRawArrBindings(raw, formatter) {
  const expectedBindings = raw.bindings.length;
  const values = raw.bindings;
  let index = 0;

  const sql = raw.sql.replace(/\\?\?\??/g, function(match) {
    if (match === '\\?') {
      return match;
    }

    const value = values[index++];

    if (match === '??') {
      return formatter.columnize(value);
    }
    return formatter.parameter(value);
  });

  if (expectedBindings !== index) {
    throw new Error(`Expected ${expectedBindings} bindings, saw ${index}`);
  }

  return {
    method: 'raw',
    sql,
    bindings: formatter.bindings,
  };
}

class Raw {
  public client;
  public sql;
  public bindings = [];
  protected wrappedBefore;
  protected wrappedAfter;
  protected options;

  constructor(client) {
    this.client = client;
  }
  set(sql, bindings) {
    this.sql = sql;
    this.bindings =
      (isObject(bindings) && !bindings.toSQL) || isUndefined(bindings) ? bindings : [bindings];

    return this;
  }

  // Wraps the current sql with `before` and `after`.
  wrap(before, after) {
    this.wrappedBefore = before;
    this.wrappedAfter = after;
    return this;
  }

  // Calls `toString` on the Knex object.
  toString() {
    return this.toQuery();
  }

  // Returns the raw sql for the query.
  toSQL(method, tz) {
    let obj;
    const formatter = this.client.formatter(this);

    if (Array.isArray(this.bindings)) {
      obj = replaceRawArrBindings(this, formatter);
    } else if (this.bindings && isPlainObject(this.bindings)) {
      obj = replaceKeyBindings(this, formatter);
    } else {
      obj = {
        method: 'raw',
        sql: this.sql,
        bindings: isUndefined(this.bindings) ? [] : [this.bindings],
      };
    }

    if (this.wrappedBefore) {
      obj.sql = this.wrappedBefore + obj.sql;
    }
    if (this.wrappedAfter) {
      obj.sql = obj.sql + this.wrappedAfter;
    }

    obj.options = reduce(this.options, assign, {});

    obj.bindings = obj.bindings || [];

    if (helpers.containsUndefined(obj.bindings)) {
      const undefinedBindingIndices = helpers.getUndefinedIndices(this.bindings);
      debugBindings(obj.bindings);
      throw new Error(
        `Undefined binding(s) detected for keys [${undefinedBindingIndices}] when compiling RAW query: ${obj.sql}`,
      );
    }

    return obj;
  }
}

export default Raw;
