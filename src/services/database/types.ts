export interface Collection {
  name: string;
}

export interface Entity {
  id: string;
  type: string;
  data: object;
  changes?: object;
  syncedAt: string;
  createdAt: string;
}
