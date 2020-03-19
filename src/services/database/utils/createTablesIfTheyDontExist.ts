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
  "data" TEXT,
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
     UPDATE documents_index set data=new.data, collection= new.collection where id= old.id;
    END;
`;
};

const deleteSearchRecordTrigger = () => {
  return `CREATE TRIGGER IF NOT EXISTS documents_search_auto_delete AFTER DELETE ON documents 
   BEGIN
    DELETE FROM documents_index where id= old.id;
   END;`;
};

// event table triggers

const eventPayloadSql = item => {
  return `json_set(json(${item}.data),'$.createdAt',${item}.createdAt, '$.updatedAt',${item}.updatedAt)`;
};

const createEventRecordTrigger = () => {
  return `CREATE TRIGGER IF NOT EXISTS document_event_auto_insert AFTER INSERT ON documents 
    WHEN new.syncedAt is null
    BEGIN
      INSERT INTO document_events(document_id,type,collection,data) 
           VALUES (new.id,'created',new.collection,${eventPayloadSql('new')});
    END;`;
};

const updateEventRecordTrigger = () => {
  return ` CREATE TRIGGER IF NOT EXISTS documents_event_auto_update AFTER UPDATE ON documents 
    WHEN new.syncedAt is null
    BEGIN
       INSERT INTO document_events(document_id,type,collection,data) 
           VALUES (new.id,'updated',new.collection,${eventPayloadSql('new')});
    END;
`;
};

const deleteEventRecordTrigger = () => {
  return `CREATE TRIGGER IF NOT EXISTS documents_event_auto_delete AFTER DELETE ON documents 
   WHEN json_extract(old.data,'$."is_server_deleted"') is null
   BEGIN
      INSERT INTO document_events(document_id,type,collection,data) 
           VALUES (new.id,'updated',new.collection,${eventPayloadSql('old')});
   END;`;
};

export const createTablesIfTheyDontExist = () => {
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
