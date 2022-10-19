type SegmentDisabled = {
  id: number
  segmentId: number
  disabledBy: string
  disabledReason: string

  user?: string
  note?: string
}

export { SegmentDisabled }
