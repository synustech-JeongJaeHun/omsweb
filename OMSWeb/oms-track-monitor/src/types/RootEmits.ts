import { Point } from "../point/types/Point"
import { Station } from "../station/types/Station"
import { Buffer } from '../buffer/types/Buffer'
import { Mtl } from "../mtl/types/Mtl"
import { Zcu } from "../zcu/types/Zcu"
import { Vehicle } from "../vehicle/types/Vehicle"
import { Segment } from "../segment/types/Segment"

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
  (e: 'rotate', value: EventDetails.Rotate): void
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

  export type Rotate = { degree: number }
}

export {
  RootEmitInjectionKey,
  RootEmits,
  EventDetails
}