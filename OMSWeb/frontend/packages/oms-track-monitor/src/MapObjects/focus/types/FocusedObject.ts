import { Mtl } from 'src/TrackObjects/mtl/types/Mtl'
import { Point } from 'src/TrackObjects/point/types/Point'
import { Segment } from 'src/TrackObjects/segment/types/Segment'
import { Station } from 'src/TrackObjects/station/types/Station'
import { Buffer } from 'src/TrackObjects/buffer/types/Buffer'
import { Vehicle } from 'src/TrackObjects/vehicle/types/Vehicle'
import { Zcu } from 'src/TrackObjects/zcu/types/Zcu'
import { Fireshutter } from 'src/TrackObjects/fireshutter/types/Fireshutter'
//XXX: Fireshutter Focused된 Object를 풀기 위해서는 타입 지정 필요
type FocusedObject =
	| Vehicle
	| Point
	| Segment
	| Station
	| Buffer
	| Mtl
	| Zcu
	| Fireshutter

export { FocusedObject }
