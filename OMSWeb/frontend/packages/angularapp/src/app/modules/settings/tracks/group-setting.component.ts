import { Component, OnInit } from '@angular/core'
import { forkJoin, Observable, of } from 'rxjs'
import _ = require('lodash')
import { tap } from 'rxjs/operators'
import {
	ISettingsGroup,
	ISettingsGroupedObject,
} from '../../../models/settings.model'
import { SettingsService } from '../../../services/settings.service'
import { MessagesService } from '../../../services/messages.service'

@Component({
	selector: 'oms-group-setting',
	templateUrl: './group-setting.component.html',
	styleUrls: ['./group-setting.component.scss'],
})
export class GroupSettingComponent implements OnInit {
	ready = false

	groups: ISettingsGroup[] = []
	groupedObjects: ISettingsGroupedObject[] = []

	selectedItem: ISettingsGroup

	assignedHomePoints: number[] = []
	assignedStations: number[] = []
	assignedVehicles: number[] = []
	assignedBuffers: number[] = []

	homePoints: number[] = []
	stations: number[] = []
	vehicles: number[] = []
	buffers: number[] = []

	private _changedItems: ISettingsGroup[] = []
	//private _changedVehicleItems: number[] = [];

	get noData(): boolean {
		return this.ready && this.groups.length === 0
	}

	get isUpdated(): boolean {
		return this.ready && this.groups.length > 0 && this._changedItems.length > 0
	}

	constructor(
		private settingsSvc: SettingsService,
		private messageSvc: MessagesService,
	) {
		this.init()
	}

	private init() {
		forkJoin([this.loadGroups(), this.loadGroupedObjects()]).subscribe(() => {
			if (this.groups.length) {
				this.selectedItem = this.groups[0]
				forkJoin([this.bindGroupData(this.selectedItem.id)])
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
		this.settingsSvc
			.settingsGroupIsAvailableHomePoints(groupId)
			.subscribe((res) => {
				this.homePoints = res
			})
		this.settingsSvc
			.settingsGroupIsAvailableStations(groupId)
			.subscribe((res) => {
				this.stations = res
			})
		this.settingsSvc
			.settingsGroupIsAvailableVehicles(groupId)
			.subscribe((res) => {
				this.vehicles = res
			})
		this.settingsSvc
			.settingsGroupIsAvailableBuffers(groupId)
			.subscribe((res) => {
				this.buffers = res
			})

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
	}

	onGroupChanged() {
		this.bindGroupData(this.selectedItem.id)
	}

	ngOnInit(): void {}

	onChange(type: string, picked: number[]) {
		const { objects } = this.selectedItem

		let pushedItem = {} as ISettingsGroup
		pushedItem.id = this.selectedItem.id
		//pushedItem.objects = new Array(0);
		pushedItem.homePoints = new Array(0)
		pushedItem.stations = new Array(0)
		pushedItem.vehicles = new Array(0)
		pushedItem.buffers = new Array(0)

		let items = picked

		if (type == 'homePoints') {
			if (this._changedItems.every((x) => x.id !== this.selectedItem.id)) {
				for (let idx = 0; idx < items.length; idx++) {
					//pushedItem.objects.push(items[idx]);
					pushedItem.homePoints.push(items[idx])
				}
				this._changedItems.push(pushedItem)
			} else {
				//this._changedItems.find((x) => x.id === this.selectedItem.id).objects = new Array(0);
				this._changedItems.find(
					(x) => x.id === this.selectedItem.id,
				).homePoints = new Array(0)

				for (let idx = 0; idx < items.length; idx++) {
					//this._changedItems.find((x) => x.id === this.selectedItem.id).objects.push(items[idx]);
					this._changedItems
						.find((x) => x.id === this.selectedItem.id)
						.homePoints.push(items[idx])
				}
			}
		} else if (type == 'stations') {
			if (this._changedItems.every((x) => x.id !== this.selectedItem.id)) {
				for (let idx = 0; idx < items.length; idx++) {
					//pushedItem.objects.push(items[idx]);
					pushedItem.stations.push(items[idx])
				}
				this._changedItems.push(pushedItem)
			} else {
				//this._changedItems.find((x) => x.id === this.selectedItem.id).objects = new Array(0);
				this._changedItems.find((x) => x.id === this.selectedItem.id).stations =
					new Array(0)

				for (let idx = 0; idx < items.length; idx++) {
					//this._changedItems.find((x) => x.id === this.selectedItem.id).objects.push(items[idx]);
					this._changedItems
						.find((x) => x.id === this.selectedItem.id)
						.stations.push(items[idx])
				}
			}
		} else if (type == 'vehicles') {
			if (this._changedItems.every((x) => x.id !== this.selectedItem.id)) {
				for (let idx = 0; idx < items.length; idx++) {
					//pushedItem.objects.push(items[idx]);
					pushedItem.vehicles.push(items[idx])
				}
				this._changedItems.push(pushedItem)
			} else {
				//this._changedItems.find((x) => x.id === this.selectedItem.id).objects = new Array(0);
				this._changedItems.find((x) => x.id === this.selectedItem.id).vehicles =
					new Array(0)

				for (let idx = 0; idx < items.length; idx++) {
					//this._changedItems.find((x) => x.id === this.selectedItem.id).objects.push(items[idx]);
					this._changedItems
						.find((x) => x.id === this.selectedItem.id)
						.vehicles.push(items[idx])
				}
			}
		} else if (type == 'buffers') {
			if (this._changedItems.every((x) => x.id !== this.selectedItem.id)) {
				for (let idx = 0; idx < items.length; idx++) {
					//pushedItem.objects.push(items[idx]);
					pushedItem.buffers.push(items[idx])
				}
				this._changedItems.push(pushedItem)
			} else {
				//this._changedItems.find((x) => x.id === this.selectedItem.id).objects = new Array(0);
				this._changedItems.find((x) => x.id === this.selectedItem.id).buffers =
					new Array(0)

				for (let idx = 0; idx < items.length; idx++) {
					//this._changedItems.find((x) => x.id === this.selectedItem.id).objects.push(items[idx]);
					this._changedItems
						.find((x) => x.id === this.selectedItem.id)
						.buffers.push(items[idx])
				}
			}
		}
		/*
    if (this._changedItems.every((x) => x.id !== this.selectedItem.id)) {
      for (let idx = 0; idx < items.length; idx++) {
        pushedItem.objects.push(items[idx]);
      }
      this._changedItems.push(pushedItem);
    } else {
      this._changedItems.find((x) => x.id === this.selectedItem.id).objects = new Array(0);

      for (let idx = 0; idx < items.length; idx++) {
        this._changedItems.find((x) => x.id === this.selectedItem.id).objects.push(items[idx]);
      }
    }
    */
	}

	onSave() {
		if (!this._changedItems.length) return

		this.SaveMessages(this._changedItems)

		// before code for update
		// this._changedItems = []
		// // this._changedVehicleItems = [];
		// this.bindGroupData(this.selectedItem.id)

		// after code for update
		setTimeout(() => {
			this.onRevert()
		}, 500)
	}

	onRevert() {
		this._changedItems = []
		//this._changedVehicleItems = [];

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

			if (items[idx].homePoints.length > 0) {
				let currentAssignedHomePoints = this.groupedObjects
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
			}

			let addedStations = []
			let removedStations = []

			if (items[idx].stations.length > 0) {
				let currentAssignedStations = this.groupedObjects
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
			}

			let addedVehicles = []
			let removedVehicles = []

			if (items[idx].vehicles.length > 0) {
				let currentAssignedVehicles = this.groupedObjects
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
			}

			let addedBuffers = []
			let removedBuffers = []

			if (items[idx].buffers.length > 0) {
				let currentAssignedBuffers = this.groupedObjects
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
			}

			const group: number = this.selectedItem.id

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
}
