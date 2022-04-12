import { Component, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { HubService } from '@oms/root/services/hub.service'
import { DxDataGridComponent } from 'devextreme-angular'
import DataSource from 'devextreme/data/data_source'
import { AuthService } from '../../../services/auth.service'
import { DialogService } from '../../../services/dialog.service'
import { MessagesService } from '../../../services/messages.service'
import { SystemsService } from '../../../services/systems.service'

@Component({
	selector: 'oms-vehilce-control',
	templateUrl: './vehicle-control.component.html',
	styleUrls: ['./vehicle-control.component.scss'],
})
export class VehicleControlComponent implements OnInit {
	// dataGrid: DxDataGridComponent;
	// dataSource: DataSource;
	// selectedIds: number[] = [];

	// current info (readonly)
	currentMapName = ''
	currentMapVersion = ''
	currentFileName = ''

	// update info (two-way bind)
	updateMapName = ''
	public get updateMapVersion() {
		return parseInt(this.currentMapVersion) + 1
	}
	updateFileName = ''

	// map files
	maps: string[] = []

	isUpdating = false

	get hasControlAccess(): boolean {
		return this.auth.isAuthenticated
	}

	// get canControl(): boolean {
	//   return this.selectedIds.length > 0;
	// }

	updateMapFiles() {
		return this.systemSvc.maps().subscribe((maps) => (this.maps = maps))
	}

	constructor(
		private auth: AuthService,
		private systemSvc: SystemsService,
		private dialogSvc: DialogService,
		private messageSvc: MessagesService,
		private t$: TranslateService,
	) {
		// this.dataSource = this.systemSvc.vehicles();
		this.updateMapFiles()
	}

	ngOnInit(): void {
		this.getCurrentMap()
	}

	getCurrentMap() {
		this.systemSvc.currentMap().subscribe((res) => {
			this.currentMapName = res.dbName
			this.currentMapVersion = String(res.dbVersion)
			this.currentFileName = res.srcMapFile
		})
	}

	onUpdateMap() {
		this.dialogSvc
			.confirm({ body: this.t$.instant('messages.confirmCommand') })
			.subscribe((ok) => {
				if (ok) {
					// @TODO call update
					this.messageSvc
						.sendMapUpdateCommand({
							action: 'map_update',
							map_db_name: this.updateMapName,
							map_source_file: this.updateFileName,
							//this.updateMapVersion;
						})
						.subscribe(() => {
							this.getCurrentMap()
							this.isUpdating = false
						})

					this.isUpdating = true
				}
			})
	}

	// onRefresh() {
	//   console.info('# refresh >>', this.selectedIds);
	// }
	// onUpdateVehicles() {
	//   this.dialogSvc
	//     .confirm({ body: this.t$.instant('messages.confirmCommand') })
	//     .subscribe((ok) => {
	//       if (ok) {
	//         // @TODO call update
	//       }
	//     });
	// }
	// onRemoveVehicle() {
	//   if (!this.canControl) return;
	//   this.dialogSvc
	//     .confirm({ body: this.t$.instant('messages.confirmCommand') })
	//     .subscribe((ok) => {
	//       if (ok) {
	//         this.messageSvc
	//           .sendVehicleDirectCommand({ action: 'remove' }, this.selectedIds)
	//           .subscribe();
	//       }
	//     });
	// }

	// calculateConflict(rowData: { mapDb?: string; mapVersion?: number }) {
	// 	// there is no mapVersion in row, now

	// 	const isMapSame = rowData?.mapDb === this.currentMapName
	// 	const isVersionSame =
	// 		rowData?.mapVersion === parseInt(this.currentMapVersion)

	// 	return isMapSame
	// 		? isVersionSame
	// 			? ''
	// 			: 'Version Conflict'
	// 		: 'Map Conflict'
	// }
}
