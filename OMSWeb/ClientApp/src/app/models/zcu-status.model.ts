
export interface IZcuStatusRow {
  id: number;
  logicalId: string;
  usingType: number;
  zcuType: number;
  status: boolean;
  errorCode: number;
  passVehicle?: string[];
  vehicleCount?: string[];
  vehicleInfo?: string[];
}

