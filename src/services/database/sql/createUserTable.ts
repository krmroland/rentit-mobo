const talbleSql = tableName => `CREATE TABLE  IF NOT EXISTS "${tableName}" (
  "id"  varchar NOT NULL,
  "accountId" integer NOT NULL,
  "collection" string NOT NULL,
  "data"  text NOT NULL,
  "changes" text,
  "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "syncedAt" datetime,
  PRIMARY KEY("id")
);`;

const createIndex = (tableName, column) => {
  return `CREATE INDEX  IF NOT EXISTS "${tableName}_${column}_index" ON "${tableName}" ("${column}");`;
};

const createVirtualTable = (tableName, indexedTable) => {
  return `CREATE VIRTUAL TABLE IF NOT EXISTS ${indexedTable} USING fts5(id, data, collection UNINDEXED);`;
};

const createInsertTrigger = (tableName, indexedTable) => {
  return `CREATE TRIGGER IF NOT EXISTS ${indexedTable}_auto_insert AFTER INSERT ON ${tableName} BEGIN
      INSERT INTO ${indexedTable}(id,data,collection) VALUES (new.id, new.data,new.collection);
    END;`;
};

const createUpdateTrigger = (tableName, indexedTable) => {
  return ` CREATE TRIGGER IF NOT EXISTS ${indexedTable}_auto_update AFTER UPDATE ON ${tableName} BEGIN
      INSERT INTO ${indexedTable}(${indexedTable}, id) VALUES('delete', old.id);
      INSERT INTO ${indexedTable}(id, data,collection) VALUES (new.id, new.data,new.collection);
    END;
`;
};

const createDeleteTrigger = (tableName, indexedTable) => {
  return `CREATE TRIGGER IF NOT EXISTS ${indexedTable}_auto_delete AFTER DELETE ON ${tableName} BEGIN
    INSERT INTO ${indexedTable}(${indexedTable}, id) VALUES('delete', old.id);
  END;`;
};

export const createUserTable = userId => {
  const tableName = `user_${userId}_table`;
  const indexedTable = `${tableName}_search`;

  return [
    talbleSql(tableName),
    createIndex(tableName, 'accountId'),
    createIndex(tableName, 'collection'),
    createVirtualTable(tableName, indexedTable),
    createInsertTrigger(tableName, indexedTable),
    createUpdateTrigger(tableName, indexedTable),
    createDeleteTrigger(tableName, indexedTable),
  ];
};
