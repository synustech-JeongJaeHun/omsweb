
export interface ICpsStatusRow {
  cps_can_id: number;
  cps_converter_id: number;
  cps_status: number;
  cps_voltage: number;
  cps_current_igbt: number;
  cps_current_track: number;
  cps_frequency: number;
  cps_temp_radiator: number;
  cps_temp_inernal: number;
  cps_sync: number;
  cps_backup_id: number;
  cps_error_code: number;
  cps_voltage_rs: number;
  cps_voltage_st: number;
  cps_voltage_tr: number;
  cps_current_r: number;
  cps_current_s: number;
  cps_current_t: number;
  cps_total_kw: number;
  cps_wh: number;
}

