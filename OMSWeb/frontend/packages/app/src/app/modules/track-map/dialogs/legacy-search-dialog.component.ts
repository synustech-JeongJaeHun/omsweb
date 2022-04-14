import { Component, OnInit } from '@angular/core'

import { IKeyValuePair } from '@oms/models/base.model'
import { MatDialogRef } from '@angular/material/dialog'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'

type Ids = { id: number; logicalId: string }
type ObjectTypeKey = 'point' | 'segment' | 'station' | 'mtl' | 'buffer'

@Component({
	selector: 'oms-legacy-search-dialog',
	templateUrl: './legacy-search-dialog.component.html',
	styles: [
		`
			.form-item {
				margin-bottom: 4px;
			}
		`,
	],
})
export class LegacySearchDialogComponent implements OnInit {
	objectTypes = [
		// { key: 'vehicle', value: 'Vehicle' },
		{ key: 'point', value: 'Point' },
		{ key: 'segment', value: 'Segment' },
		{ key: 'station', value: 'Station' },
		{ key: 'buffer', value: 'Buffer' },
		{ key: 'mtl', value: 'MTL' },
		// { key: 'cluster', value: 'Cluster' },
	]
	targets: number[]

	selectedType: string
	selectedId: number

	private dataSourceMap: Record<ObjectTypeKey, Ids[]>

	get canSelectTarget(): boolean {
		return !!this.selectedType && this.targets.length > 0
	}

	constructor(
		private dialog: MatDialogRef<LegacySearchDialogComponent>,
		private playbackPlayService: PlaybackPlayService,
	) {}

	ngOnInit(): void {
		this.initDataSource()
	}

	onSearch(type: string, value: string) {
		const { id } = this.dataSourceMap[type].find((e) => e.logicalId === value)
		this.dialog.close({ type, value: id })
	}

	private initDataSource() {
		this.dataSourceMap = {
			point: this.playbackPlayService.track.data.points.map((x) => ({
				id: x.id,
				logicalId: x.logical_id,
			})),
			buffer: this.playbackPlayService.track.data.buffers.map((x) => ({
				id: x.id,
				logicalId: x.logicalId,
			})),
			station: this.playbackPlayService.track.data.stations.map((x) => ({
				id: x.id,
				logicalId: x.logical_id,
			})),
			mtl: this.playbackPlayService.track.data.mtls.map((x) => ({
				id: x.id,
				logicalId: x.logical_id,
			})),
			segment: this.playbackPlayService.track.data.segments.map((x) => ({
				id: x.id,
				logicalId: x.logical_id,
			})),
		}
	}

	onSelectType(item: IKeyValuePair<string, string>) {
		if (!item) return
		this.selectedType = item.key
		this.targets = this.getSelectionTargets(item.key)
	}

	private getSelectionTargets(selectedType: string): number[] {
		return this.dataSourceMap[selectedType]
	}
}
