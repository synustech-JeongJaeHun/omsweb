import { Buffer } from 'src/TrackObjects/buffer/types/Buffer'
import { Station } from 'src/TrackObjects/station/types/Station'
import { Vehicle } from 'src/TrackObjects/vehicle/types/Vehicle'

type CarrierFocusedObject = Vehicle | Buffer | Station

export { CarrierFocusedObject }
