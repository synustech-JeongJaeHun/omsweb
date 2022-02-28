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
 */


const RootEmitInjectionKey = "RootEmit"
interface RootEmits {
  (e: 'tooltipon', value: EventDetails.TooltipOn): void
  (e: 'tooltipoff', value: EventDetails.TooltipOff): void
  (e: 'focus', value: EventDetails.Focus): void
  /**
   * avoid "contextmenu" for basic htmlelement event fired
   */
  (e: 'contextmenuon', value: EventDetails.ContextmenuOn): void
  (e: 'backdrop', value: EventDetails.Backdrop): void
}

namespace EventDetails {

  export type TooltipOn =
    | { type: "Point", value: Point }
    | { type: "Segment", value: Segment }
    | { type: "Station", value: Station }
    | { type: "Buffer", value: Buffer }
    | { type: "Mtl", value: Mtl }
    | { type: "Zcu", value: Zcu }
    | { type: "Vehicle", value: Vehicle }

  export type TooltipOff = void

  export type Focus =
    | { type: "Point", value: Point }
    | { type: "Segment", value: Segment }
    | { type: "Station", value: Station }
    | { type: "Buffer", value: Buffer }
    | { type: "Mtl", value: Mtl }
    | { type: "Zcu", value: Zcu }
    | { type: "Vehicle", value: Vehicle }

  export type ContextmenuOn =
    | { type: "Point", value: Point }
    | { type: "Segment", value: Segment }
    | { type: "Station", value: Station }
    | { type: "Buffer", value: Buffer }
    | { type: "Mtl", value: Mtl }
    | { type: "Zcu", value: Zcu }
    | { type: "Vehicle", value: Vehicle }

  export type Backdrop = void
}

export {
  RootEmitInjectionKey,
  RootEmits,
  EventDetails
}