/**
 * @argument A : Counter-Clock
 * @argument C : Clock
 */
type CurveDirection = "A" | "C"
type Quadrant = "1" | "2" | "3" | "4"

type SegmentPart = { segpartId: number } & (
  | {
    type: "D"
  }
  | {
    type: "E",
    direction: CurveDirection,
    location: Quadrant
  })

export { CurveDirection, Quadrant, SegmentPart }