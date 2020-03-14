import { isFunction, isUndefined, isPlainObject, isArray, isTypedArray } from 'lodash';

export const normalizeArr = (...parameters) => {
  const args = new Array(parameters.length);
  for (let i = 0; i < args.length; i++) {
    args[i] = parameters[i];
  }
  if (Array.isArray(args[0])) {
    return args[0];
  }
  return args;
};

export const containsUndefined = mixed => {
  if (isTypedArray(mixed)) {
    return false;
  }

  if (mixed && isFunction(mixed.toSQL)) {
    //Any QueryBuilder or Raw will automatically be validated during compile.
    return false;
  }

  let argContainsUndefined = false;

  if (isArray(mixed)) {
    for (let i = 0; i < mixed.length; i++) {
      if (argContainsUndefined) {
        break;
      }
      argContainsUndefined = containsUndefined(mixed[i]);
    }
  } else if (isPlainObject(mixed)) {
    for (const key in mixed) {
      if (mixed.hasOwnProperty(key)) {
        if (argContainsUndefined) {
          break;
        }
        argContainsUndefined = containsUndefined(mixed[key]);
      }
    }
  } else {
    argContainsUndefined = isUndefined(mixed);
  }

  return argContainsUndefined;
};

export const addQueryContext = Target => {
  // Stores or returns (if called with no arguments) context passed to
  // wrapIdentifier and postProcessResponse hooks
  Target.prototype.queryContext = function(context) {
    if (isUndefined(context)) {
      return this.queryContext;
    }
    this.queryContext = context;
    return this;
  };
};

export const getUndefinedIndices = mixed => {
  const indices = [];

  if (Array.isArray(mixed)) {
    mixed.forEach((item, index) => {
      if (containsUndefined(item)) {
        indices.push(index);
      }
    });
  } else if (isPlainObject(mixed)) {
    Object.keys(mixed).forEach(key => {
      if (containsUndefined(mixed[key])) {
        indices.push(key);
      }
    });
  } else {
    indices.push(0);
  }

  return indices;
};
