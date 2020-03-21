import Builder from './builder';

import Compiler from './compiler';

describe('Builder tests', () => {
  let builder;

  beforeEach(() => {
    builder = new Builder(new Compiler());
  });

  test('where correctly sets there wheres for nested objects', () => {
    builder.where({ foo: 'bar' });

    expect(builder.wheres).toEqual(
      expect.arrayContaining([{ type: 'Basic', column: 'foo', operator: '=', boolean: 'and' }]),
    );

    expect(builder.bindings.where).toEqual(expect.arrayContaining(['bar']));
  });

  test('where correctly sets = as default operator', () => {
    builder.where('name', 'doe');

    expect(builder.wheres).toEqual(
      expect.arrayContaining([{ type: 'Basic', column: 'name', operator: '=', boolean: 'and' }]),
    );

    expect(builder.bindings.where).toEqual(expect.arrayContaining(['doe']));
  });

  test('where with null values sets the nullity type', () => {
    builder.where('name', null);

    expect(builder.wheres).toEqual(
      expect.arrayContaining([{ type: 'Nullable', column: 'name', isNull: true }]),
    );

    expect(builder.bindings.where).toHaveLength(0);
  });

  test('whereData  sets the type to data column', () => {
    builder.whereData({ foo: 'bar' });

    expect(builder.wheres).toEqual(
      expect.arrayContaining([
        { type: 'DataColumn', column: 'foo', operator: '=', boolean: 'and' },
      ]),
    );

    expect(builder.bindings.where).toEqual(expect.arrayContaining(['bar']));
  });

  test('whereData correctly sets = as default operator', () => {
    builder.whereData('name', 'doe');

    expect(builder.wheres).toEqual(
      expect.arrayContaining([
        { type: 'DataColumn', column: 'name', operator: '=', boolean: 'and' },
      ]),
    );

    expect(builder.bindings.where).toEqual(expect.arrayContaining(['doe']));
  });

  test('it correctly forms the insert query', () => {
    const insert = jest.fn();

    builder = new Builder(new Compiler(), { insert });

    builder.from('documents').insert({ name: 'Roland', id: 10, age: 100 });

    expect(insert.mock.calls).toHaveLength(1);

    expect(insert.mock.calls[0][0]).toBe(
      'insert into documents ("name","id","age") values (?, ?, ?)',
    );

    expect(insert.mock.calls[0][1]).toEqual(['Roland', 10, 100]);
  });

  test('it correctly forms the bulk insert query', () => {
    const insert = jest.fn();

    builder = new Builder(new Compiler(), { insert });

    builder.from('documents').insert([
      { name: 'Roland', id: 10, age: 100 },
      { id: 1, name: 'John doe', age: 120 },
    ]);

    expect(insert.mock.calls).toHaveLength(1);

    expect(insert.mock.calls[0][0]).toBe(
      //items should be arranged alphabetically
      'insert into documents ("age","id","name") values (?, ?, ?), (?, ?, ?)',
    );

    expect(insert.mock.calls[0][1]).toEqual([100, 10, 'Roland', 120, 1, 'John doe']);
  });
});
