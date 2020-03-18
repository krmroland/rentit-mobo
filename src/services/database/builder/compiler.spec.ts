import Compiler from './compiler';

import Builder from './builder';

describe('Compiler Tests', () => {
  let compiler;
  let builder;
  beforeEach(() => {
    compiler = new Compiler();
    builder = new Builder(compiler);
  });
  test('it compiles a full query', () => {
    builder
      .where({ 'data->name': 'roland' })
      .where('age', '>=', 20)
      .select(['name', 'data->sex as sex'])
      .limit(10)
      .skip(2);

    expect(builder.toSql()).toBe(
      `select distinct "name",json_extract("data", '$."sex"') as "sex" from documents where json_extract("data", '$."name"') = ? and "age" >= ? limit 10 offset 2`,
    );
  });

  test('it compiles  a count aggregate', () => {
    builder.setAggregate('count', ['data->name']);

    expect(builder.toSql()).toBe(
      `select count(distinct json_extract("data", '$."name"')) as aggregate from documents`,
    );
  });
});
