import { isString, tail } from 'lodash';

export default abstract class BaseCompiler {
  public builder;
  protected _commonBuilder;
  public client;
  public schema;
  public formatter;
  public sequence = [];

  constructor(client, builder) {
    this.builder = builder;
    this._commonBuilder = this.builder;
    this.client = client;
    this.schema = builder._schema;
    this.formatter = client.formatter(builder);
  }

  pushQuery(query) {
    if (!query) {
      return;
    }
    if (isString(query)) {
      query = { sql: query };
    }
    if (!query.bindings) {
      query.bindings = this.formatter.bindings;
    }
    this.sequence.push(query);

    this.formatter = this.client.formatter(this._commonBuilder);
  }
  unshiftQuery(query) {
    if (!query) {
      return;
    }
    if (isString(query)) {
      query = { sql: query };
    }
    if (!query.bindings) {
      query.bindings = this.formatter.bindings;
    }
    this.sequence.unshift(query);

    this.formatter = this.client.formatter(this._commonBuilder);
  }
  pushAdditional(...parameters) {
    let [fn] = parameters;
    const child = new this(this.client, this.tableCompiler, this.columnBuilder);
    fn.call(child, tail(parameters));
    this.sequence.additional = (this.sequence.additional || []).concat(child.sequence);
  }
}
