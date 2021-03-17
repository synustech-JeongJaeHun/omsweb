export interface IKeyValuePair<TK, TV> {
  key: TK;
  value: TV;
}

export interface IPaginatedResult<T> {
  total: number;
  items: T[];
  filtered: number;
}

export interface IPaginatedRequest {
  start: number;
  length: number;
  query: any;
  order: any;
}
