
export interface IClusterStatusRow {
  id: number;
  server_id: number;
  logicalId: string;
  status: string;
  voltage: string;
  current_igbt: string;
  current_track: string;
  frequency: string;
  temp_radiator: string;
  temp_internal: string;
  sync: string;
  backup_id: string;
  error_code: string;
  voltage_rs: string;
  voltage_st: string;
  voltage_tr: string;
  current_r: string;
  current_s: string;
  current_t: string;
  total_kw: string;
  wh: string;
}

