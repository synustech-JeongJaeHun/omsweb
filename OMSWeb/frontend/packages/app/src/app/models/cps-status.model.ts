
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

/*
export interface PeriodicElement {
  position: number,
  name: string;
  normal: string;
  warning: string;
  fault: string;
}
export const DEFAULT_ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Voltage', normal: '265 ~ 350 V', warning: '350 ~ 430 V', fault: '> 430 V' },
  { position: 2, name: 'Current IGBT', normal: '0 ~ 130 A', warning: '130 ~ 140 A', fault: '> 140 A' },
  { position: 3, name: 'Current Track', normal: '70 ~ 85 A', warning: '85 ~ 95 A', fault: '> 95 A' },
  { position: 4, name: 'Temp Radiator', normal: '0 ~ 60 ℃', warning: '60 ~ 80 ℃', fault: '> 80 ℃' },
  { position: 5, name: 'Temp Internal', normal: '0 ~ 35 ℃', warning: '35 ~ 40 ℃', fault: '> 40 ℃' },
];*/
export interface PeriodicElement {
  position: number,
  name: string;
  normal: Range[];
  warning: Range[];
  fault: Range[];
}
export const DEFAULT_ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Voltage',
    normal: [{
      unit: 'V',
      low: 265,
      high: 350,
      lowEqual: false,
      highEqual: false
    }],
    warning:[{
      unit: 'V',
      low: 350,
      high: 430,
      lowEqual: true,
      highEqual: false
    }],
    fault:[{
      unit: 'V',
      low: 430,
      lowEqual: true,
      highEqual: false
    }]
  },
  {
    position: 2,
    name: 'Current IGBT',
    normal: [{
      unit: 'A',
      low: 0,
      high: 130,
      lowEqual: false,
      highEqual: false
    }],
    warning:[{
      unit: 'A',
      low: 130,
      high: 140,
      lowEqual: true,
      highEqual: false
    }],
    fault: [{
      unit: 'A',
      low: 140,
      lowEqual: true,
      highEqual: false
    }]
  },
  { position: 3, name: 'Current Track',
    normal: [{
      unit: 'A',
      low: 70,
      high: 85,
      lowEqual: false,
      highEqual: false
    }],
    warning: [{
      unit: 'A',
      low: 85,
      high: 95,
      lowEqual: true,
      highEqual: false
    }],
    fault: [{
      unit: 'A',
      low: 95,
      lowEqual: true,
      highEqual: false
    }]
  },
  { position: 4, name: 'Temp Radiator',
    normal: [{
      unit: '℃',
      low: 0,
      high: 60,
      lowEqual: false,
      highEqual: false
    }],
    warning: [{
      unit: '℃',
      low: 60,
      high: 80,
      lowEqual: true,
      highEqual: false
    }],
    fault: [{
      unit: '℃',
      low: 80,
      lowEqual: true,
      highEqual: false
    }]
  },
  { position: 5, name: 'Temp Internal',
    normal: [{
      unit: '℃',
      low: 0,
      high: 35,
      lowEqual: false,
      highEqual: false
    }],
    warning: [{
      unit: '℃',
      low: 35,
      high: 40,
      lowEqual: true,
      highEqual: false
    }],
    fault: [{
      unit: '℃',
      low: 40,
      lowEqual: true,
      highEqual: false
    }]
  },
];

export interface Range{
  unit: string
  low?: number
  high?: number
  lowEqual: boolean
  highEqual: boolean
}
export function rangeCheck(input: Range, value: number): boolean{
  if(input.highEqual && input?.high===value) return true
  if(input.lowEqual && input?.low===value) return true
  if(input?.low < input?.high){
    if(input?.low < value && value < input?.high) return true
  }
  else if(input?.low > input?.high){
    if(input?.low > value && value > input?.high) return true
  }
  else if(input?.low && !input?.high){
    if(input?.low < value) return true
  }
  else if(!input?.low && input?.high){
    if(input?.high > value) return true
  }

  return false;
}
export function rangeToRef(input: Range): string{
  if(!input) return ''

  const lowSign = input.lowEqual? '<' : '≤'
  const highSign = input.highEqual? '>' : '≥'
  let ref= ''
  if(input?.low < input?.high){
    ref+= `${input.low} ~ ${input.high}`
  }
  else if(input?.low && !input?.high){
    ref+= `${highSign}${input.low}`
  }
  else if(!input?.low && input?.high){
    ref+= `${lowSign}${input.high}`
  }
  return ref+` ${input.unit}`
}
