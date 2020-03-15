import isPlainObject from 'lodash/isPlainObject';
import { v4 as uuidv4 } from 'uuid';

export const perepareInsert = (tableName: string, accountId: number, collection: string, data) => {
  if (!isPlainObject(data)) {
    console.warn('given data', data);
    throw new Error('Data must be a plain object');
  }

  const sql = `insert into ${tableName} (id,accountId,collection,data) values(?,?,?,json_array(?))`;

  const id = uuidv4();

  return {
    sql,
    bindings: [id, accountId, collection, JSON.stringify({ ...data, id })],
  };
};
