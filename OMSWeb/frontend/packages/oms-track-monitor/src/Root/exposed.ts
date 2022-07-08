import { IOmsTrackMonitor } from './types/IOmsTrackMonitor'
import {
	centerZoom,
	getCameraAndRotation,
	setCameraAndRotation,
	approachTo,
} from 'MapObjects/cameraAndRotation'
import { calculateMinMaxXYFromPoints } from 'src/MapObjects/map/utils/size'
import { initMapSizeProperties } from 'src/MapObjects/map/mapSizeProperties'
import {
	deleteHomeToPoint,
	findPointById,
	initPoints,
	insertHomeToPoint,
	updateHomeToPoint,
} from 'src/TrackObjects/point/points'
import {
	findBufferById,
	initBuffers,
	setBuffer,
} from 'src/TrackObjects/buffer/buffers'
import { findMtlById, initMtls } from 'src/TrackObjects/mtl/mtls'
import {
	findSegmentById,
	initSegments,
} from 'src/TrackObjects/segment/segments'
import { initClusters } from 'src/TrackObjects/cluster/clusters'
import {
	findStationById,
	initStations,
	setStation,
} from 'src/TrackObjects/station/stations'
import {
	deleteZcu,
	findZcuById,
	initZcus,
	setZcu,
} from 'src/TrackObjects/zcu/zcus'
//XXX: fireshutter
import {
	findFireshutterById,
	initFireshutters,
	setFireshutter,
} from 'src/TrackObjects/fireshutter/fireshutters'
import {
	deleteVehicle,
	findVehicleById,
	initVehicles,
	setVehicle,
} from 'src/TrackObjects/vehicle/vehicles'
import {
	deleteSegmentDisabled,
	initSegmentDisableds,
	insertSegmentDisabled,
} from 'src/TrackObjects/segment/segmentDisableds'
import {
	deleteGroupObject,
	insertGroupObject,
	updateGroupObject,
	initGroups,
} from 'src/TrackObjects/group/groups'
import { createPathElement } from 'src/utils/svg/path'
import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer'
import { setFocusedObject } from 'src/MapObjects/focus/focus'
import { setTrackedObject } from 'src/MapObjects/track/track'

const exposed: IOmsTrackMonitor = {
	getCameraAndRotation,
	setCameraAndRotation,

	setTrack(t) {
		// clean up : order is reverse of setup
		initGroups([])
		initSegmentDisableds([])
		initVehicles([])
		initZcus([])
		initStations([])
		initClusters([])
		initSegments([])
		initMtls([])
		initBuffers([])
		initPoints([])
		// XXX: fireshutter init
		initFireshutters([])

		// setup
		const { minX, minY, maxX, maxY } = calculateMinMaxXYFromPoints(
			t.points ?? []
		)
		initMapSizeProperties(minX, minY, maxX, maxY)

		// Order is IMPORTANT!
		// point must be initialized first.
		initPoints(t.points)
		initBuffers(t.buffers)
		initMtls(t.mtls)
		initSegments(t.segmentParts)
		initClusters(t.clusters)
		initStations(t.stations)
		initZcus(t.zcus)
		initVehicles(t.vehicles ?? [])
		initSegmentDisableds(t.segmentDisabled ?? [])
		initGroups(t.groups)

		// XXX:set fireshutters
		// DB에도 값이 들어가게 되면 아래와 같이 수정
		// initFireshutters(t.fireshutters)
		initFireshutters([
			{ id: 1, x: 9594, y: 2957, status: 'OPEN' },
			{ id: 2, x: 9900, y: 3000, status: 'CLOSE' },
		])
	},
	centerZoom,

	find(type, id) {
		switch (type.trim().toLowerCase()) {
			case 'vehicle':
				const vehicle = findVehicleById(id)
				if (vehicle) this.find('point', vehicle.curPoint)
				break
			case 'point':
				const point = findPointById(id)
				if (point) {
					approachTo({ x: point.x, y: point.y })
				}
				break
			case 'segment':
				const segment = findSegmentById(id)
				if (segment) {
					const path = createPathElement(segment.d)
					const position = path.getPointAtLength(path.getTotalLength() / 2)

					approachTo(position)
				}
				break
			case 'station':
				const station = findStationById(id)
				if (station) {
					const position = getPositionForBufferOrStation(station)

					if (position) approachTo(position)
				}
				break
			case 'buffer':
				const buffer = findBufferById(id)
				if (buffer) {
					const position = getPositionForBufferOrStation(buffer)

					if (position) approachTo(position)
				}
				break
			case 'mtl':
				const mtl = findMtlById(id)
				if (mtl) this.find('point', mtl.pointId)
				break
			///XXX: fireshutter
			case 'fireshutter':
				break

			default:
				break
		}
	},

	focus(type, id) {
		switch (type.trim().toLowerCase()) {
			case 'vehicle':
				const vehicle = findVehicleById(id)
				if (vehicle) {
					setFocusedObject(vehicle)
				}
				break
			case 'point':
				const point = findPointById(id)
				if (point) {
					setFocusedObject(point)
				}
				break
			case 'segment':
				const segment = findSegmentById(id)
				if (segment) {
					setFocusedObject(segment)
				}
				break
			case 'station':
				const station = findStationById(id)
				if (station) {
					setFocusedObject(station)
				}
				break
			case 'buffer':
				const buffer = findBufferById(id)
				if (buffer) {
					setFocusedObject(buffer)
				}
				break
			case 'mtl':
				const mtl = findMtlById(id)
				if (mtl) {
					setFocusedObject(mtl)
				}
			case 'zcu':
				const zcu = findZcuById(id)
				if (zcu) {
					setFocusedObject(zcu)
				}

				break
			case 'fireshutter':
				// XXX: focus case 가 필요할 시 추가할 것
				break

			default:
				break
		}
	},
	dropFocus() {
		setFocusedObject(undefined)
	},

	track(type, id) {
		// there is only vehicle.

		const vehicle = findVehicleById(id)
		if (vehicle) {
			setTrackedObject(vehicle)
		}
	},
	stopTrack() {
		setTrackedObject(undefined)
	},

	updateVehicle(op, v) {
		switch (op) {
			case 'INSERT':
			case 'UPDATE':
				setVehicle(v)
				break

			case 'DELETE':
				deleteVehicle(v)
				break
		}
	},
	updateSegmentDisabled(op, sd) {
		switch (op) {
			case 'INSERT':
				if (sd.operation === 'INSERT') insertSegmentDisabled(sd.data)
				break
			case 'DELETE':
				deleteSegmentDisabled(sd.id)
				break
		}
	},
	updateZcu(op, z) {
		switch (op) {
			case 'UPDATE':
				setZcu(z)
				break
			case 'DELETE':
				deleteZcu(z)
			default:
				break
		}
	},

	updateStation(op, s) {
		switch (op) {
			case 'UPDATE':
				setStation(s)
				break

			default:
				break
		}
	},

	updateBuffer(op, s) {
		switch (op) {
			case 'UPDATE':
				setBuffer(s)
				break

			default:
				break
		}
	},

	updateGroupObject(op, go, data) {
		switch (op) {
			case 'INSERT':
				insertGroupObject(go)
				break
			case 'UPDATE':
				if (data) updateGroupObject(data)
				break
			case 'DELETE':
				deleteGroupObject(go)
				break

			default:
				break
		}
	},

	updateHome(op, h) {
		switch (op) {
			case 'INSERT':
				insertHomeToPoint(h)
				break
			case 'UPDATE':
				updateHomeToPoint(h)
				break
			case 'DELETE':
				deleteHomeToPoint(h)
				break

			default:
				break
		}
	},
}

export { exposed }
