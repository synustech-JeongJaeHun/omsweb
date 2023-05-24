import { CanBeCarrierFocused } from 'src/MapObjects/focus/types/CanBeCarrierFocused'
import { CanBeFocused } from 'src/MapObjects/focus/types/CanBeFocused'

type Backdrop = {
  id: number
  logicalId: string
  x: number
  y: number
  width: number
  height: number
  backgroundColor?: string
  outlineThickness?: number
  outlineColor?: string
  outlineRadius?: number
  outlineType?: number
  contents: string
  direction?: number
  vAlign?: number
  hAlign?: number
  bold: number
  italic: boolean
  fontSize: number
  textColor?: string
} & CanBeFocused &
  CanBeCarrierFocused

export { Backdrop }
