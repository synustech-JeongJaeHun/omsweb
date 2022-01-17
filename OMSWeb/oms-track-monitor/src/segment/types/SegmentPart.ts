type SegmentPart = { segpartId: number } & (
  | { type: "D" }
  | {
    type: "E",
    /**
     * @argument A : Counter-Clock
     * @argument C : Clock
     */
    direction: "A" | "C",
    /**
     * @argument 1 : Quadrant 1
     * @argument 2 : Quadrant 2
     * @argument 3 : Quadrant 3
     * @argument 4 : Quadrant 4
     */
    location: "1" | "2" | "3" | "4"
  })

export { SegmentPart }