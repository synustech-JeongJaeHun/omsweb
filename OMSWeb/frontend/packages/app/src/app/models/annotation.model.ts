//import { IIdObject } from "./base.model";

export interface IAnnotation {
  id: number;
  referenceId: number;
  referenceTable: string;
  modifiedBy: string;
  annotation: string;
}
