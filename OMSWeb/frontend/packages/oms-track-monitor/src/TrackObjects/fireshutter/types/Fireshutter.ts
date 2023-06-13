import { CanBeFocused } from "src/MapObjects/focus/types/CanBeFocused"

type Fireshutter = {
	id: number
	x: number
	y: number
	logicalId: string
	segments: string
	status: number
  fireDetect: number
  open:number
} & CanBeFocused

export { Fireshutter }
