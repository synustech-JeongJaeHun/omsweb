import { Point } from "TrackObjects/point/types/Point"
import { Station } from "TrackObjects/station/types/Station"
import { Buffer } from 'TrackObjects/buffer/types/Buffer'
import { Mtl } from "TrackObjects/mtl/types/Mtl"
import { Zcu } from "TrackObjects/zcu/types/Zcu"
import { Vehicle } from "TrackObjects/vehicle/types/Vehicle"
import { Segment } from "TrackObjects/segment/types/Segment"

/**
 * if you change this file,
 * then change "export-types\oms-track-monitor.d.ts" file too
 * 
 * NOT NOW...
 */

const RootEmitInjectionKey = "RootEmit"
interface RootEmits {
  // for focus ...
  (e: 'mainClickOnObject', value: EventDetails.MainClickOnObject): void
  // for contextmenu ...
  (e: 'secondaryClickOnObject', value: EventDetails.SecondaryClickOnObject): void
  // for backdrop...
  (e: 'clickOutObject', value: EventDetails.ClickOutObject): void
  // tooltip on
  (e: 'mouseoverOnObject', value: EventDetails.MouseoverOnObject): void
  // tooltip off
  (e: 'mouseleaveOnObject', value: EventDetails.MouseleaveOnObject): void
}

namespace EventDetails {

  export type MouseoverOnObject =
    | { type: "POINT", value: Point }
    | { type: "SEGMENT", value: Segment }
    | { type: "STATION", value: Station }
    | { type: "BUFFER", value: Buffer }
    | { type: "MTL", value: Mtl }
    | { type: "ZCU", value: Zcu }
    | { type: "VEHICLE", value: Vehicle }

  export type MouseleaveOnObject = void

  export type MainClickOnObject =
    | { type: "POINT", value: Point }
    | { type: "SEGMENT", value: Segment }
    | { type: "STATION", value: Station }
    | { type: "BUFFER", value: Buffer }
    | { type: "MTL", value: Mtl }
    | { type: "ZCU", value: Zcu }
    | { type: "VEHICLE", value: Vehicle }

  export type SecondaryClickOnObject =
    | { type: "POINT", value: Point }
    | { type: "SEGMENT", value: Segment }
    | { type: "STATION", value: Station }
    | { type: "BUFFER", value: Buffer }
    | { type: "MTL", value: Mtl }
    | { type: "ZCU", value: Zcu }
    | { type: "VEHICLE", value: Vehicle }

  export type ClickOutObject = void
}

export {
  RootEmitInjectionKey,
  RootEmits,
  EventDetails
}