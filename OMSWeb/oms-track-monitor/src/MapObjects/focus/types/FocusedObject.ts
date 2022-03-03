import { Mtl } from "src/TrackObjects/mtl/types/Mtl"
import { Point } from "src/TrackObjects/point/types/Point"
import { Segment } from "src/TrackObjects/segment/types/Segment"
import { Station } from "src/TrackObjects/station/types/Station"
import { Buffer } from "src/TrackObjects/buffer/types/Buffer";

type FocusedObject =
  | Point
  | Segment
  | Station
  | Buffer
  | Mtl

export { FocusedObject }