import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { data } from 'jquery';
import { Observable } from 'rxjs';
import { ObjectDirections } from '../../../models/enums';
import { IVehicleRegForm, ISettingsVehicleReg } from '../../../models/settings.model';

@Component({
  selector: 'oms-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss']
})
export class VehicleFormComponent implements OnInit {
  @Input() vehicleReg: ISettingsVehicleReg;
  @Input() addMode: boolean = false;
  @Input() dataSource: ISettingsVehicleReg[] = [];
  @Output() save = new EventEmitter<IVehicleRegForm>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  private _formModel: IVehicleRegForm;


  get f(): { [key: string]: FormControl } {
    return this.form.controls as { [key: string]: FormControl };
  }

  constructor() { }

  ngOnInit(): void {
    this.initForm();
    this.listenToIDChange();
    //this.listenToLogicalNameChange();    
  }

  onSave() {
    const { ...rest } = this.form.value;
    this.form.valid && this.save.emit({ ...rest });
  }

  onCancel() {
    this.cancel.emit();
  }

  private initForm() {
    this._formModel = Object.assign({}, this.vehicleReg);

    this.form = new FormGroup(
      {
        id: new FormControl(this._formModel.id, [Validators.required]),
        logicalId: new FormControl(this._formModel.logicalId, [Validators.required]),
      }
    );
  }

  listenToIDChange() {
    this.form.controls.id.valueChanges.subscribe(id => {
      if (isNaN(id)) {
        this.form.controls.id.setErrors({ invalidNumber: true })  // <--- Set invalidNumber to true 
      } else if (this.isContainDataSourceID(id, this.dataSource)) {
        this.form.controls.id.setErrors({ duplicatedNumber: true }) // <--- Set duplicatedNumber to true
      } else {
        this.form.controls.id.setErrors(null)
      }
    })
  }

  /*
  listenToLogicalNameChange() {
    this.form.controls.name.valueChanges.subscribe(logicalId => {
      if (this.isContainDataSourceLogicalId(logicalId, this.dataSource)) {
        this.form.controls.logicalId.setErrors({ duplicatedLogicalId: true }) // <--- Set duplicated logicalId to true
      } else {
        this.form.controls.logicalId.setErrors(null)
      }
    })
  }
  */

  private isContainDataSourceID(id: number, data?: ISettingsVehicleReg[]): boolean {
    if (data) {
      for (let idx = 0; idx < data.length; idx++) {
        if (data[idx].id == id.toString())
          return true;
      }
    }
    return false;
  }

  /*
  private isContainDataSourceLogicalId(name: string, data?: ISettingsVehicleReg[]): boolean {
    if (data) {
      for (let idx = 0; idx < data.length; idx++) {
        if (data[idx].logicalId == name)
          return true;
      }
    }
    return false;
  }
  */
}
