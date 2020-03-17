const talbleSql = () => `CREATE TABLE  IF NOT EXISTS "documents" (
  "id"  varchar not null,
  "accountId" unsigned integer not null,
  "collection" string not null,
  "data"  text not null,
  "createdAt" timestamp not null  default  CURRENT_TIMESTAMP,
  "updatedAt" timestamp not null   default CURRENT_TIMESTAMP,
  "syncedAt" timestamp,
  primary key("id")
);`;

const eventsTableSql = () => `CREATE TABLE  IF NOT EXISTS "document_events" (
  "id"  integer,
  "document_id" varchar NOT NULL,
  "type" varchar string not null,
  "collection" varchar string not null,
  "payload" TEXT,
  "createdAt" timestamp NOT NULL default   CURRENT_TIMESTAMP,
  primary key("id")
);`;

const createIndex = column => {
  return `CREATE INDEX  IF NOT EXISTS "documents_${column}_index" ON "documents" ("${column}");`;
};

const createVirtualTable = () => {
  return `CREATE VIRTUAL TABLE IF NOT EXISTS documents_index USING fts5(id, data, collection UNINDEXED);`;
};

/** search triggers **/
const createSearchRecordTrigger = () => {
  return `CREATE TRIGGER IF NOT EXISTS document_search_auto_insert AFTER INSERT ON documents 
    BEGIN
      INSERT INTO documents_index(id,data,collection) VALUES (new.id, new.data,new.collection);
    END;`;
};

const updateSearchRecordTrigger = () => {
  return ` CREATE TRIGGER IF NOT EXISTS documents_search_auto_update AFTER UPDATE ON documents 
    BEGIN
      INSERT INTO documents_index(documents_index, id) VALUES('delete', old.id);
    END;
`;
};

const deleteSearchRecordTrigger = () => {
  return `CREATE TRIGGER IF NOT EXISTS documents_search_auto_delete AFTER DELETE ON documents 
   BEGIN
    INSERT INTO documents_index(documents_index, id) VALUES('delete', old.id);
   END;`;
};

// event table triggers
const createEventRecordTrigger = () => {
  return `CREATE TRIGGER IF NOT EXISTS document_event_auto_insert AFTER INSERT ON documents 
    WHEN new.syncedAt is null
    BEGIN
      INSERT INTO document_events(document_id,type,collection,payload) VALUES (new.id,'created',new.collection,new.data);
    END;`;
};

const updateEventRecordTrigger = () => {
  return ` CREATE TRIGGER IF NOT EXISTS documents_event_auto_update AFTER UPDATE ON documents 
    WHEN new.syncedAt is null or  strftime('%s', new.syncedAt) !=  strftime('%s', old.syncedAt)
    BEGIN
       INSERT INTO document_events(document_id,type,collection,payload) VALUES (new.id,'updated',new.collection,new.data);
    END;
`;
};

const deleteEventRecordTrigger = () => {
  return `CREATE TRIGGER IF NOT EXISTS documents_event_auto_delete AFTER DELETE ON documents 
   WHEN json_extract(old.data,'$."is_server_deleted"') is null
   BEGIN
     INSERT INTO document_events(document_id,type,collection) VALUES (old.id,'deleted',old.collection);
   END;`;
};

export const createDatabaseTables = () => {
  return [
    talbleSql(),
    eventsTableSql(),
    createIndex('accountId'),
    createIndex('collection'),
    createVirtualTable(),
    //search triggers
    createSearchRecordTrigger(),
    updateSearchRecordTrigger(),
    deleteSearchRecordTrigger(),
    // event triggers
    createEventRecordTrigger(),
    updateEventRecordTrigger(),
    deleteEventRecordTrigger(),
  ];
};
