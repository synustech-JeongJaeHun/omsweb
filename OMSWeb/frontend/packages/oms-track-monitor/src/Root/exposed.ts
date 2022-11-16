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
import { findClusterById, initClusters } from 'src/TrackObjects/cluster/clusters'
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
import {
	initFireshutters,
	updateFireshutter,
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
import { scaleStylesInfo } from '../styles/styles'
import { deleteClusterState, initClusterStates, insertClusterState, updateClusterState } from 'src/TrackObjects/cluster/clusterStates'
import { cameraViewBoxInfo } from 'src/MapObjects/map/camera'
import { setCarrierFocusedObject } from 'src/MapObjects/focus/carrierFocus'

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
    initClusterStates([])
		initClusters([])
		initSegments([])
		initMtls([])
		initBuffers([])
		initPoints([])
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
		initClusterStates(t.clusterStates)
		initClusters(t.clusters)
		initStations(t.stations)
		initZcus(t.zcus)
		initVehicles(t.vehicles ?? [])
		initSegmentDisableds(t.segmentDisabled ?? [])
		initGroups(t.groups)
		initFireshutters(t.fireShutters)
	},
	centerZoom,

	find(type, id) {
		switch (type.trim().toLowerCase()) {
			case 'vehicle':
        {
          const vehicle = findVehicleById(id)
          if(!vehicle) return
          const point = findPointById(vehicle.curPoint)
          if(!point) return
          approachTo({ x: point.x, y: point.y }, cameraViewBoxInfo.height)
        }
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
					const position = getPositionForBufferOrStation(
						station,
						scaleStylesInfo.stationMargin
					)

					if (position) approachTo(position)
				}
				break
			case 'buffer':
				const buffer = findBufferById(id)
				if (buffer) {
					const position = getPositionForBufferOrStation(
						buffer,
						scaleStylesInfo.bufferMargin
					)

					if (position) approachTo(position)
				}
				break
			case 'mtl':
				const mtl = findMtlById(id)
				if (mtl) this.find('point', mtl.pointId)
				break
			case 'zcu':
				const zcu = findZcuById(id)
				if (zcu) approachTo(zcu)
				break
			case 'cluster':
				const cluster = findClusterById(id)
				if(cluster?.centerPosition) approachTo(cluster.centerPosition, 60000)
        break
			case 'fireshutter':
				break

			default:
				break
		}
	},

	focus(type, id, focusType:  "PRIMARY" | "CARRIER" = "PRIMARY") {
    if (focusType === 'PRIMARY'){
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
          break;
        case 'zcu':
          const zcu = findZcuById(id)
          if (zcu) {
            setFocusedObject(zcu)
          }
          break
        case 'cluster':
          const cluster = findClusterById(id)
          if (cluster) {
            setFocusedObject(cluster)
          }
          break
        case 'fireshutter':
          break

        default:
          break
      }
    }else if(focusType === 'CARRIER'){
      switch (type) {
        case 'vehicle':
          const vehicle = findVehicleById(id)
          if (vehicle) {
            setCarrierFocusedObject(vehicle)
          }
          break
        case 'buffer':
          const buffer = findBufferById(id)
          if (buffer) {
            setCarrierFocusedObject(buffer)
          }
          break
      
        default:
          break;
      }
    }

	},
	dropFocus(focusType:  "PRIMARY" | "CARRIER" = "PRIMARY") {
    if(focusType === 'PRIMARY') setFocusedObject(undefined)
    else if(focusType === 'CARRIER') setCarrierFocusedObject(undefined)
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

	updateFireshutter(op, f) {
		switch (op) {
			case 'INSERT':
				break
			case 'UPDATE':
				updateFireshutter(f)
				break
			case 'DELETE':
				break
			default:
				break
		}
	},

	updateMtl(op, mtls) {
		switch (op) {
			case 'INSERT':
				break
			case 'UPDATE':
				initMtls(mtls)
				break
			case 'DELETE':
				break
			default:
				break
		}
	},

  updateClusterState(op, clusterState) {
    switch (op) {
			case 'INSERT':
        insertClusterState(clusterState)
				break
			case 'UPDATE':
				updateClusterState(clusterState)
				break
			case 'DELETE':
        deleteClusterState(clusterState)
				break
			default:
				break
    }
  }
}

export { exposed }
