const talbleSql = () => `CREATE TABLE  IF NOT EXISTS "documents" (
  "id"  varchar NOT NULL,
  "accountId" integer NOT NULL,
  "collection" string NOT NULL,
  "data"  text NOT NULL,
  "changes" text,
  "createdAt" datetime NOT NULL DEFAULT(strftime('YYYY-MM-DDTHH:MM:SS.SSS','now','localtime')),
  "updatedAt" datetime NOT NULL DEFAULT(strftime('YYYY-MM-DDTHH:MM:SS.SSS','now','localtime')),
  "syncedAt" datetime,
  PRIMARY KEY("id")
);`;

const createIndex = column => {
  return `CREATE INDEX  IF NOT EXISTS "documents_${column}_index" ON "documents" ("${column}");`;
};

const createVirtualTable = () => {
  return `CREATE VIRTUAL TABLE IF NOT EXISTS documents_index USING fts5(id, data, collection UNINDEXED);`;
};

const createInsertTrigger = () => {
  return `CREATE TRIGGER IF NOT EXISTS document_index_auto_insert AFTER INSERT ON documents BEGIN
      INSERT INTO documents_index(id,data,collection) VALUES (new.id, new.data,new.collection);
    END;`;
};

const createUpdateTrigger = () => {
  return ` CREATE TRIGGER IF NOT EXISTS documents_index_auto_update AFTER UPDATE ON documents BEGIN
      INSERT INTO documents_index(documents_index, id) VALUES('delete', old.id);
      INSERT INTO documents_index(id, data,collection) VALUES (new.id, new.data,new.collection);
    END;
`;
};

const createDeleteTrigger = () => {
  return `CREATE TRIGGER IF NOT EXISTS documents_index_auto_delete AFTER DELETE ON documents BEGIN
    INSERT INTO documents_index(documents_index, id) VALUES('delete', old.id);
  END;`;
};

export const createDatabaseTables = () => {
  return [
    talbleSql(),
    createIndex('accountId'),
    createIndex('collection'),
    createVirtualTable(),
    createInsertTrigger(),
    createUpdateTrigger(),
    createDeleteTrigger(),
  ];
};
