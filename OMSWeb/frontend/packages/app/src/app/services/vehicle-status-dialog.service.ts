import { Injectable, EventEmitter } from '@angular/core'
import {
	MatDialog,
	MatDialogRef,
	MatDialogState,
} from '@angular/material/dialog'
import { Dto } from '../models/dto/track.model'
import { VehicleStatusDialogComponent } from '../modules/track-map/dialogs/vehicle-status-dialog.component'
import { TrackStatusService } from './track-status.service'

@Injectable({
	providedIn: 'root',
})
export class VehicleStatusDialogService {
	constructor(
		trackStatusService: TrackStatusService,
		private dialog: MatDialog,
	) {
		this.setSelectedVehicle(trackStatusService.trackData.vehicles?.[0])
	}

	private _vhStatusDlg: MatDialogRef<VehicleStatusDialogComponent, any>

	public selectedVehicle?: Dto.IVehicle
	public selectedVehicleChanged$ = new EventEmitter<Dto.IVehicle>()

	setSelectedVehicle = (vhl?: Dto.IVehicle) => {
		this.selectedVehicle = vhl ? JSON.parse(JSON.stringify(vhl)) : undefined
		this.selectedVehicleChanged$.emit(this.selectedVehicle)
	}

	toggleVehicleStatusDialog = () => {
		if (this._vhStatusDlg?.getState() === MatDialogState.OPEN)
			return this._vhStatusDlg.close()

		this._vhStatusDlg = this.dialog.open(VehicleStatusDialogComponent, {
			width: '750px',
			minWidth: '750px',
			maxWidth: '750px',
			height: '620px',
			minHeight: '620px',
			maxHeight: '620px',
			autoFocus: false,
			hasBackdrop: false,
			disableClose: false,
			closeOnNavigation: true,
		})
	}
  
	openVehicleStatusDialog = () => {
		if (this._vhStatusDlg?.getState() === MatDialogState.OPEN) return

		this._vhStatusDlg = this.dialog.open(VehicleStatusDialogComponent, {
			width: '750px',
			minWidth: '750px',
			maxWidth: '750px',
			height: '620px',
			minHeight: '620px',
			maxHeight: '620px',
			autoFocus: false,
			hasBackdrop: false,
			disableClose: false,
			closeOnNavigation: true,
		})
	}

	closeVehicleStatusDialog = () => {
		this._vhStatusDlg?.close()
	}
}
