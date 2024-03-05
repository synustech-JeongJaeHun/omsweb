import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,} from '@angular/core'
import {FormControl} from '@angular/forms'
import {TrackStatusService} from '@oms/root/services/track-status.service'
import {Observable, of} from 'rxjs'
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators'
import {ILookupUnit} from '../../../models/map.interface'
import {SettingsService} from "@oms/services/settings.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
	selector: 'oms-unit-selector',
	templateUrl: './unit-selector.component.html',
	styles: [
		`
			mat-option {
				font-size: 12px;
			}
			.option-type {
				font-weight: bold;
				color: #999;
				padding-left: 30px;
			}

			::ng-deep input:disabled {
				color: black !important;
				font-weight: bold;
			}
		`,
	],
})
export class UnitSelectorComponent implements OnInit, OnChanges {
	@Input() findScopes: string[] = ['points', 'stations', 'buffers']
	@Input() filterWords?: string[]
	@Input() excludeMtlPoints?: boolean
	@Input() disabled: boolean = false
	@Input() selectedUnit: ILookupUnit
	@Input() placeholder: string
	@Output() selectedUnitChange = new EventEmitter<ILookupUnit>()

	inputControl = new FormControl()
	targetOptions$: Observable<ILookupUnit[]>

	constructor(private trackStatusService: TrackStatusService,
              private settingSvc: SettingsService,
              private $t: TranslateService) {}
	ngOnChanges(changes: SimpleChanges): void {
		const { disabled } = changes

		if (this.selectedUnit) {
			this.inputControl.disable()
			this.inputControl.setValue(this.selectedUnit)
		} else {
			this.inputControl.enable()
			this.inputControl.reset()
		}

		if (disabled) {
			disabled.currentValue
				? this.inputControl.disable()
				: this.inputControl.enable()
		}
	}

	ngOnInit(): void {
		this.targetOptions$ = this.inputControl.valueChanges.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			// switchMap((value) => this.idSvc.lookupUnitsByLogicalId(this.findScopes, value))
			switchMap((value) => {
				return of(this.filterTrackData(value))
			}),
		)

		if (this.selectedUnit) this.inputControl.disable()
	}
	displayFn(item: ILookupUnit): string | undefined {
		if (!item) return
    const displayType = this.parsingObjectType(item.objectType)
		return `${displayType} #${item.logicalId}`
	}
	onSelected(item: ILookupUnit) {
		this.selectedUnitChange.emit(item)
		this.inputControl.setValue('', { onlySelf: true })
	}
	onClear() {
		this.selectedUnitChange.emit(undefined)
		this.inputControl.reset()
	}

  parsingObjectType(type: string): string{
    switch (type.toLowerCase()){
      case 'vehicle':
        return this.$t.instant(this.labelDisplayTable('vehicle_label'))
      case 'station':
        return this.$t.instant(this.labelDisplayTable('station_label'))
      case 'buffer':
        return this.$t.instant(this.labelDisplayTable('buffer_label'))
      case 'zcu':
        return this.$t.instant(this.labelDisplayTable('zcu_label'))
      case 'cluster':
        return this.$t.instant(this.labelDisplayTable('cps_label'))
      default :
        return type
    }
  }

  labelDisplayTable(type: string): string {
    return this.settingSvc.globalPreferences.controlTables[type]
  }
	
	validInput(){
		if(this.inputControl.dirty){
			this.inputControl.setValue('', { onlySelf: true })
			// todo Autocomplete when typing
			/*
			const word = this.inputControl.value.split('#')
			const value = this.filterTrackData(word)[0]
			*/
		}
	}
	
	filterTrackData(value: string){
		const result: ILookupUnit[] = []
		if (this.findScopes.includes('vehicles')) {
			result.push(
				...this.trackStatusService.trackData.vehicles
					.filter((v) => v.logicalId.includes(value))
					.map((v) => ({
						id: v.id,
						objectType: 'Vehicle',
						logicalId: v.logicalId,
						physicalId: v.physicalId,
					})),
			)
		}
		if (this.findScopes.includes('points')) {
			const points = this.trackStatusService.trackData.points
				.filter((p) => p.logicalId.includes(value))
				.map((p) => ({
					id: p.id,
					objectType: 'Point',
					logicalId: p.logicalId,
					physicalId: p.physicalId,
				}))

			if (this.excludeMtlPoints) {
				const mtlPoints = (
					this.trackStatusService.trackData.mtls ?? []
				).map((mtl) => mtl.pointId)
				const filtered = points.filter((p) => !mtlPoints.includes(p.id))

				result.push(...filtered)
			} else {
				result.push(...points)
			}
		}
		if (this.findScopes.includes('stations')) {
			result.push(
				...this.trackStatusService.trackData.stations
					.filter((s) => s.logicalId.includes(value))
					.map((s) => ({
						id: s.id,
						objectType: 'Station',
						logicalId: s.logicalId,
						physicalId: s.physicalId,
					})),
			)
		}
		if (this.findScopes.includes('buffers')) {
			result.push(
				...this.trackStatusService.trackData.buffers
					.filter((b) => b.logicalId.includes(value))
					.map((b) => ({
						id: b.id,
						objectType: 'Buffer',
						logicalId: b.logicalId,
						physicalId: b.physicalId,
					})),
			)
		}

		if (this.findScopes.includes('mtls')) {
			result.push(
				...this.trackStatusService.trackData.mtls
					.filter(
						(m) => m.logicalId.includes(value), //permit all //&& m.inDirection !== 'R',
					)
					.map((m) => {
						return {
							id: m.id,
							objectType: 'Mtl',
							logicalId: m.logicalId,
							physicalId: m.physicalId,
							unuse: m.unuse,
							inDirection: m.inDirection,
							outDirection: m.outDirection,
						}
					}),
			)
		}
		if (this.filterWords) {
			return result.filter((unit) =>
				this.filterWords.some((word) => unit.logicalId?.includes(word)),
			)
		} else {
			return result
		}
	}
}
