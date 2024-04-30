import { Component, OnInit } from '@angular/core'
import { forkJoin, Observable } from 'rxjs'
import _ = require('lodash')
import { tap } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { ISettingsGroup, ISettingsGroupedObject} from '../../../models/settings.model'
import { TranslateService } from '@ngx-translate/core'
import { SettingsService } from '../../../services/settings.service'
import { MessagesService } from '../../../services/messages.service'
import { DialogService } from '../../../services/dialog.service'
import { SystemsService } from '../../../services/systems.service'
import { ISystemStates } from '../../../models/system.model'
import { TscModeEnums } from '@oms/models/enums'
import { TrackStatusService } from '@oms/root/services/track-status.service'

@Component({
	selector: 'oms-group-setting',
	templateUrl: './group-setting.component.html',
	styleUrls: ['./group-setting.component.scss'],
})
export class GroupSettingComponent implements OnInit {
	ready = false

	private systemStates: ISystemStates
	private destroy$ = new Subject<void>()

	groups: ISettingsGroup[] = []
	groupedObjects: ISettingsGroupedObject[] = []

	selectedGroupId: number

	assignedHomePoints: number[] = []
	assignedStations: number[] = []
	assignedVehicles: number[] = []
	assignedBuffers: number[] = []

	homePoints: number[] = []
	stations: number[] = []
	vehicles: number[] = []
	buffers: number[] = []

	private _changedItems: ISettingsGroup[] = []

	get noData(): boolean {
		return this.ready && this.groups.length === 0
	}

	get isUpdated(): boolean {
		return this.ready && this.groups.length > 0 && this._changedItems.length > 0
	}

	constructor(
		private trackStatusService: TrackStatusService,
		private settingsSvc: SettingsService,
		private messageSvc: MessagesService,
		private systemSvc: SystemsService,
		private dialogSvc: DialogService,
		private $t: TranslateService,
	) {
		this.init()
	}

	private init() {
		forkJoin([this.loadGroups(), this.loadGroupedObjects()]).subscribe(() => {
			if (this.groups.length) {
				this.selectedGroupId = this.selectedGroupId ?? this.groups[0]?.id
				forkJoin([this.bindGroupData(this.selectedGroupId)])
			}
			this.ready = true
		})
	}

	private loadGroups() {
		return this.settingsSvc.settingsGroups().pipe(
			tap((res) => {
				this.groups = res
			}),
		)
	}
	private loadGroupedObjects() {
		return this.settingsSvc.settingsGroupedObjects().pipe(
			tap((res) => {
				this.groupedObjects = res
			}),
		)
	}

	private bindGroupData(groupId: number) {
		this.assignedHomePoints = this.groupedObjects
			.filter(
				(x: ISettingsGroupedObject) =>
					x.groupId === groupId && x.referenceTable === 'home',
			)
			.map((x) => x.referenceId)
		this.assignedStations = this.groupedObjects
			.filter(
				(x: ISettingsGroupedObject) =>
					x.groupId === groupId && x.referenceTable === 'station',
			)
			.map((x) => x.referenceId)
		this.assignedVehicles = this.groupedObjects
			.filter(
				(x: ISettingsGroupedObject) =>
					x.groupId === groupId && x.referenceTable === 'vehicle',
			)
			.map((x) => x.referenceId)
		this.assignedBuffers = this.groupedObjects
			.filter(
				(x: ISettingsGroupedObject) =>
					x.groupId === groupId && x.referenceTable === 'buffer',
			)
			.map((x) => x.referenceId)

		const {
			buffers = [],
			stations = [],
			vehicles = [],
			points = [],
		} = this.trackStatusService.trackData

		this.stations = stations
			.map((s) => s.id)
			.filter((id) => this.assignedStations.includes(id) === false)
		this.buffers = buffers
			.map((b) => b.id)
			.filter((id) => this.assignedBuffers.includes(id) === false)
		this.vehicles = vehicles
			.map((v) => v.id)
			.filter((id) => this.assignedVehicles.includes(id) === false)
		this.homePoints = points
			.filter((p) => p.homeId)
			.map((p) => p.homeId)
			.filter((id) => this.assignedHomePoints.includes(id) === false)
	}

	onGroupChanged() {
		this.bindGroupData(this.selectedGroupId)
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		this.destroy$.next()
		this.destroy$.complete()
	}

	onChange(type: string, picked: number[]) {

		let pushedItem = {} as ISettingsGroup
		pushedItem.id = this.selectedGroupId
		//pushedItem.objects = new Array(0);
		pushedItem.homePoints = new Array(0)
		pushedItem.stations = new Array(0)
		pushedItem.vehicles = new Array(0)
		pushedItem.buffers = new Array(0)

		let items = picked

		if (type == 'homePoints') {
			if (this._changedItems.every((x) => x.id !== this.selectedGroupId)) {
				for (let idx = 0; idx < items.length; idx++) {
					//pushedItem.objects.push(items[idx]);
					pushedItem.homePoints.push(items[idx])
				}
				this._changedItems.push(pushedItem)
			} else {
				this._changedItems.find(
					(x) => x.id === this.selectedGroupId,
				).homePoints = new Array(0)

				for (let idx = 0; idx < items.length; idx++) {
					this._changedItems
						.find((x) => x.id === this.selectedGroupId)
						.homePoints.push(items[idx])
				}
			}
		} else if (type == 'stations') {
			if (this._changedItems.every((x) => x.id !== this.selectedGroupId)) {
				for (let idx = 0; idx < items.length; idx++) {
					pushedItem.stations.push(items[idx])
				}
				this._changedItems.push(pushedItem)
			} else {
				this._changedItems.find((x) => x.id === this.selectedGroupId).stations =
					new Array(0)

				for (let idx = 0; idx < items.length; idx++) {
					//this._changedItems.find((x) => x.id === this.selectedGroupId).objects.push(items[idx]);
					this._changedItems
						.find((x) => x.id === this.selectedGroupId)
						.stations.push(items[idx])
				}
			}
		} else if (type == 'vehicles') {
			if (this._changedItems.every((x) => x.id !== this.selectedGroupId)) {
				for (let idx = 0; idx < items.length; idx++) {
					//pushedItem.objects.push(items[idx]);
					pushedItem.vehicles.push(items[idx])
				}
				this._changedItems.push(pushedItem)
			} else {
				this._changedItems.find((x) => x.id === this.selectedGroupId).vehicles =
					new Array(0)

				for (let idx = 0; idx < items.length; idx++) {
					//this._changedItems.find((x) => x.id === this.selectedGroupId).objects.push(items[idx]);
					this._changedItems
						.find((x) => x.id === this.selectedGroupId)
						.vehicles.push(items[idx])
				}
			}
		} else if (type == 'buffers') {
			if (this._changedItems.every((x) => x.id !== this.selectedGroupId)) {
				for (let idx = 0; idx < items.length; idx++) {
					//pushedItem.objects.push(items[idx]);
					pushedItem.buffers.push(items[idx])
				}
				this._changedItems.push(pushedItem)
			} else {
				//this._changedItems.find((x) => x.id === this.selectedGroupId).objects = new Array(0);
				this._changedItems.find((x) => x.id === this.selectedGroupId).buffers =
					new Array(0)

				for (let idx = 0; idx < items.length; idx++) {
					//this._changedItems.find((x) => x.id === this.selectedItem.id).objects.push(items[idx]);
					this._changedItems
						.find((x) => x.id === this.selectedGroupId)
						.buffers.push(items[idx])
				}
			}
		}
	}

	/*onChange(type: string, items: number[]) {
		let changedItem = this._changedItems.find(x => x.id === this.selectedGroupId);
		
		if (!changedItem) {
			changedItem = {
				id: this.selectedGroupId,
				homePoints: [],
				stations: [],
				vehicles: [],
				buffers: []
			}
			this._changedItems.push(changedItem);
		} else {
			changedItem.homePoints = []
			changedItem.stations = []
			changedItem.vehicles = []
			changedItem.buffers = []
		}

		switch (type) {
			case 'homePoints':
				changedItem.homePoints = items.slice();
				break
			case 'stations':
				changedItem.stations = items.slice();
				break
			case 'vehicles':
				changedItem.vehicles = items.slice();
				break
			case 'buffers':
				changedItem.buffers = items.slice();
				break
			default:
				break
		}
	}*/

	onSave() {
		if (!this._changedItems.length) return

		this.systemSvc.currentState$
			.pipe(takeUntil(this.destroy$))
			.subscribe((states) => {
				if (states.tscMode === TscModeEnums.PAUSED) {
					this.SaveMessages(this._changedItems)
					
					// after code for update
					setTimeout(() => {
						this.onRevert()
					}, 500)
				} else {
					this.dialogSvc.alert({
						body: this.$t.instant('messages.confirmTSCStateNotPaused'),
					})
				}
			})
	}

	onRevert() {
		this._changedItems = []

		this.homePoints = []
		this.stations = []
		this.vehicles = []
		this.buffers = []

		this.assignedHomePoints = []
		this.assignedStations = []
		this.assignedVehicles = []
		this.assignedBuffers = []

		this.init()
	}

	SaveMessages(items: ISettingsGroup[]): Observable<void> {
		for (let idx = 0; idx < items.length; idx++) {
			let addedHomePoints = []
			let removedHomePoints = []
			let currentAssignedHomePoints = []
			let duplicate = {
				homePoints : [],
				stations : [],
				vehicles : [],
				buffers : [],
      }

			if (items[idx].homePoints.length > 0) {
				currentAssignedHomePoints = this.groupedObjects
					.filter(
						(x: ISettingsGroupedObject) =>
							x.groupId === items[idx].id && x.referenceTable === 'home',
					)
					.map((x) => x.referenceId)

				addedHomePoints = _.difference(
					items[idx].homePoints,
					currentAssignedHomePoints,
				)
				removedHomePoints = _.difference(
					currentAssignedHomePoints,
					items[idx].homePoints,
				)

				duplicate.homePoints = this.checkDuplicate(items[idx].id, items[idx].homePoints, 'home')
			}

			let addedStations = []
			let removedStations = []
			let currentAssignedStations = []

			if (items[idx].stations.length > 0) {
				currentAssignedStations = this.groupedObjects
					.filter(
						(x: ISettingsGroupedObject) =>
							x.groupId === items[idx].id && x.referenceTable === 'station',
					)
					.map((x) => x.referenceId)

				addedStations = _.difference(
					items[idx].stations,
					currentAssignedStations,
				)
				removedStations = _.difference(
					currentAssignedStations,
					items[idx].stations,
				)
        duplicate.stations = this.checkDuplicate(items[idx].id, items[idx].stations, 'station')
			}

			let addedVehicles = []
			let removedVehicles = []
			let currentAssignedVehicles = []

			if (items[idx].vehicles.length > 0) {
				currentAssignedVehicles = this.groupedObjects
					.filter(
						(x: ISettingsGroupedObject) =>
							x.groupId === items[idx].id && x.referenceTable === 'vehicle',
					)
					.map((x) => x.referenceId)

				addedVehicles = _.difference(
					items[idx].vehicles,
					currentAssignedVehicles,
				)
				removedVehicles = _.difference(
					currentAssignedVehicles,
					items[idx].vehicles,
				)

        duplicate.vehicles = this.checkDuplicate(items[idx].id, items[idx].vehicles, 'vehicle')
			}

			let addedBuffers = []
			let removedBuffers = []
			let currentAssignedBuffers = []

			if (items[idx].buffers.length > 0) {
				currentAssignedBuffers = this.groupedObjects
					.filter(
						(x: ISettingsGroupedObject) =>
							x.groupId === items[idx].id && x.referenceTable === 'buffer',
					)
					.map((x) => x.referenceId)

				addedBuffers = _.difference(items[idx].buffers, currentAssignedBuffers)
				removedBuffers = _.difference(
					currentAssignedBuffers,
					items[idx].buffers,
				)

        duplicate.buffers = this.checkDuplicate(items[idx].id, items[idx].buffers, 'buffer')
			}

			const group: number = this.selectedGroupId

      for(let key of Object.keys(duplicate)){
        if(duplicate[key].length>0){
          this.showDialogDuplicate(key, duplicate[key])
          return
        }
      }

			const addedVehicleData = this.trackStatusService.trackData.vehicles.filter(v=>{
				return addedVehicles.find(a=>a===v.id) && v.mode?.toUpperCase() === 'A'
			})
			if(addedVehicleData.length>0){
				const vehicles = addedVehicleData.map(v=>('Vehicle #'+v.id))
				this.dialogSvc.success({
					title: this.$t.instant('names.confirm'),
					body: this.$t.instant('messages.notChange', { vehicles }),
				})
				return
			}
			
			const vehicleSize = this.assignedVehicles.length+addedVehicles.length-removedVehicles.length
			const homeSize = this.assignedHomePoints.length+addedHomePoints.length-removedHomePoints.length
			if(vehicleSize>homeSize){
				this.dialogSvc.success({
					title: this.$t.instant('names.confirm'),
					body: this.$t.instant('messages.homePointValidSize'),
				})
				return 
			}

			this.messageSvc
				.sendAssignBufferGruopCommand({
					type: 'GROUP',
					action: 'group-setting',
					groupId: group,
					homeIds: addedHomePoints,
					homeIds_removed: removedHomePoints,
					stationIds: addedStations,
					stationIds_removed: removedStations,
					bufferIds: addedBuffers,
					bufferIds_removed: removedBuffers,
					vehicleIds: addedVehicles,
					vehicleIds_removed: removedVehicles,
				})
				.subscribe()
		}

		return
	}
	
  checkDuplicate(itemsId = 0, items: any[], type = 'home'){
    let others = this.groupedObjects
      .filter(
        (x: ISettingsGroupedObject) =>
          x.groupId !== itemsId && x.referenceTable === type,
      ).map((x) => x.referenceId)

    return _.intersection(items, others)
  }

  showDialogDuplicate(type='home', item: any[]){
    const field = item.map(i=>(type+i))
    this.dialogSvc.success({
      title: this.$t.instant('names.confirm'),
      body: this.$t.instant('messages.needsConfirm', { field }),
    })
  }
}
