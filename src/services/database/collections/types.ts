export interface schema {
  validation: [];
}

export interface CollectionDefinition {
  name: string;
  table?: string;

  timestamps?: boolean;

  autoIncrementing?: boolean;

  fields?: {
    [key: string]: string;
  };

  dates?: Array<string>;

  methods: {
    saving?: Function;
    creating?: Function;
    created?: Function;
    updating?: Function;
    updated?: Function;
    deleting?: Function;
    deleted?: Function;
  };
}
