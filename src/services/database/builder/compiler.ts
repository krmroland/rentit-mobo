import { isNil, isEmpty, upperFirst } from 'lodash';
import collect from 'collect.js';

import Expression from './expression';

class Compiler {
  /**
   * All of the available clause operators.
   */
  protected $operators = [
    '=',
    '<',
    '>',
    '<=',
    '>=',
    '<>',
    '!=',
    'like',
    'not like',
    'ilike',
    '&',
    '|',
    '<<',
    '>>',
  ];

  /**
   * The select components
   * @type {Array}
   */
  protected selectComponents = [
    'aggregateValue',
    'columns',
    'fromTable',
    'wheres',
    //'groups',
    // 'havings',
    'orders',
    'limitValue',
    'offsetValue',
  ];

  protected concatenate(segments: object) {
    return Object.values(segments)
      .filter(value => String(value) !== '')
      .join(' ');
  }

  /**
   * Compile a select query into SQL.
   */
  compileSelect(query) {
    if (isNil(query.columns)) {
      query.columns = ['*'];
    }

    // To compile the query, we'll spin through each component of the query and
    // see if that component exists. If it does we'll just call the compiler
    // function for the component which is responsible for making the SQL.
    return String(this.concatenate(this.compileComponents(query))).trim();
  }

  compileWheres(query, wheres) {
    // Each type of where clauses has its own compiler function which is responsible
    // for actually creating the where clauses SQL. This helps keep the code nice
    // and maintainable since each clause has a very small method that it uses.
    if (isEmpty(query.wheres)) {
      return '';
    }

    // If we actually have some where clauses, we will strip off the first boolean
    // operator, which is added by the query builders for convenience so we can
    // avoid checking for the first clauses in each of the compilers methods.

    const sql = this.compileWheresToArray(query);

    if (sql.length > 0) {
      return this.concatenateWhereClauses(query, sql);
    }

    return '';
  }

  /**
   * Compile the components necessary for a select clause.
   */
  protected compileComponents(query) {
    const sql = {};

    for (let component of this.selectComponents) {
      // To compile the query, we'll spin through each component of the query and
      // see if that component exists. If it does we'll just call the compiler
      // function for the component which is responsible for making the SQL.

      if (!isNil(query[component])) {
        const method = `compile${upperFirst(component, '')}`;

        sql[component] = this[method](query, query[component]);
      }
    }

    return sql;
  }

  /**
   * Compile the "select *" portion of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  $columns
   * @return string|null
   */
  protected compileColumns(query, columns): string {
    // If the query is actually performing an aggregating select, we will let that
    // compiler handle the building of the select clauses, as it will need some
    // more syntax that is best handled by that function to keep things neat.
    if (query.aggregateValue) {
      return '';
    }

    let select: string;

    if (query.distinctValue) {
      select = 'select distinct ';
    } else {
      select = 'select ';
    }

    return select + this.columnize(columns);
  }

  protected compileAggregateValue(query, aggregate) {
    let column = this.columnize(aggregate.columns);

    // If the query has a "distinct" constraint and we're not asking for all columns
    // we need to prepend "distinct" onto the column name so that the query takes
    // it into account when it performs the aggregating operations on the data.
    if (Array.isArray(query.distinct)) {
      column = 'distinct ' + this.columnize(query.distinct);
    } else if (query.distinct && column !== '*') {
      column = 'distinct ' + column;
    }

    return 'select ' + aggregate.name + '(' + column + ') as aggregate';
  }

  protected compileLimitValue(query, limit) {
    if (+limit) {
      return 'limit ' + Number.parseInt(limit);
    }
    console.warn('Invalid limit value:', limit);
  }

  protected compileOffsetValue(query, offset) {
    if (+offset) {
      return 'offset ' + Number.parseInt(offset);
    }
    console.warn('Invalid offset value:', offset);
  }

  /**
   * Convert an array of column names into a delimited string.
   */
  columnize(columns: Array<string | Function | Expression>) {
    return columns.map(column => this.wrap(column)).join(',');
  }

  /**
   * Wrap a value in keyword identifiers.
   *
   * @return string
   */
  wrap(value) {
    if (this.isExpression(value)) {
      return value.getValue(value);
    }

    // If the value being wrapped has a column alias we will need to separate out
    // the pieces so we can wrap each of the segments of the expression on its
    // own, and then join these both back together using the "as" connector.

    if (String(value).includes(' as ')) {
      return this.wrapAliasedValue(value);
    }
    if (this.isJsonSelector(value)) {
      return this.wrapJsonSelector(value);
    }

    return this.wrapValue(value);
  }

  protected isExpression(value) {
    return value instanceof Expression;
  }

  /**
   * Wrap a value that has an alias.
   */
  protected wrapAliasedValue(value) {
    let segments = String(value).split(' as ');
    return this.wrap(segments[0]) + ' as ' + this.wrapValue(segments[1]);
  }

  /**
   * Wrap a single string in keyword identifiers.
   */
  protected wrapValue(value) {
    return value === '*' ? value : '"' + String(value).replace('"', '""') + '"';
  }

  /**
   * Determine if the given string is a JSON selector.
   */
  protected isJsonSelector($value) {
    return String($value).includes('->');
  }
  /**
   * Wrap the given JSON selector.
   */
  protected wrapJsonSelector(value) {
    let [field, path] = this.wrapJsonFieldAndPath(value);

    return `json_extract(${field}${path})`;
  }
  /**
   * Split the given JSON selector into the field and the optional path and wrap them separately.
   */
  protected wrapJsonFieldAndPath(column) {
    let parts = String(column).split('->', 2);

    let field = this.wrap(parts[0]);

    let path = parts.length > 1 ? ', ' + this.wrapJsonPath(parts[1], '->') : '';

    return [field, path];
  }

  /**
   * Wrap the given JSON path.
   *
   */
  protected wrapJsonPath(value, delimiter = '->') {
    const parsed = String(value).replace(/([\\\\]+)?\\'/, "\\'");

    return `'$."${String(parsed).replace(delimiter, '"."')}"'`;
  }

  /**
   * Get an array of all the where clauses for the query.
   *
   * @param  \Illuminate\Database\Query\Builder  $query
   * @return array
   */
  protected compileWheresToArray(query) {
    return collect(query.wheres)
      .map(where => {
        const whereMethod = `where${where.type}`;

        return `${where.boolean} ${this[whereMethod](query, where)}`;
      })
      .all();
  }

  /**
   * Format the where clause statements into one string.
   */
  protected concatenateWhereClauses(query, sql) {
    return 'where ' + this.removeLeadingBoolean(sql.join(' '));
  }

  /**
   * Remove the leading boolean from a statement.
   */
  protected removeLeadingBoolean(value) {
    return String(value).replace(/and |or /i, '');
  }

  /**
   * Compile a basic where clause.
   *
   */
  protected whereBasic(query, where) {
    let value = this.parameter(where.value);

    return this.wrap(where.column) + ' ' + where.operator + ' ' + value;
  }

  /**
   * Compile a "where null" clause.
   */
  protected whereNullable(query, where) {
    return `${this.wrap(where.column)}  is null`;
  }

  compileFromTable(query, table) {
    return `from ${table}`;
  }
  /**
   * Compile the "order by" portions of the query.
   */
  protected compileOrders(query, orders) {
    return isEmpty(orders) ? '' : `order by ${this.compileOrdersToArray(query, orders).join(', ')}`;
  }

  /**
     * Compile the query orders to an array.
     *
    
     */
  protected compileOrdersToArray(query, orders) {
    return orders.map(order => `${this.wrap(order.column)}  ${order.direction}`);
  }

  /**
   * Create query parameter place-holders for an array.
   *
   */
  parameterize(values) {
    return Object.values(values)
      .map(value => this.parameter(value))
      .join(', ');
  }

  /**
     * Get the appropriate query parameter place-holder for a value.
  
     */
  parameter(value) {
    return this.isExpression(value) ? value.toString() : '?';
  }

  /**
   * Compile an insert statement into SQL.
   * @return string
   */
  compileInsert(query, values) {
    // Essentially we will force every insert to be treated as a batch insert which
    // simply makes creating the SQL easier for us since we can utilize the same
    // basic routine regardless of an amount of records given to us to insert.
    let table = query.fromTable;

    if (isEmpty(values)) {
      return `insert into ${table} default values`;
    }

    if (!Array.isArray(values)) {
      values = [values];
    }

    const columns = this.columnize(Object.keys(values[0]));

    // We need to build a list of parameter place-holders of values that are bound
    // to the query. Each insert should have the exact same amount of parameter
    // bindings so we will loop through the record and parameterize them all.
    const parameters = collect(values)
      .map(record => `(${this.parameterize(record)})`)
      .implode(', ');

    return `insert into ${table} (${columns}) values ${parameters}`;
  }
}

export default Compiler;
