import { ITrackData } from 'src/legacies/models/track.model'
import { UpdateDto } from 'src/types/Dto'
import {readonly, ref} from 'vue'
import { Backdrop } from './types/Backdrop'

const backdrops = ref<Backdrop[]>([])
const backdropMap = new Map<Backdrop['id'], Backdrop>()
const isBackdrop = ref<boolean>(false)

const readonlyIsBackdrop = readonly(isBackdrop)

function initBackdrops(bs: ITrackData['backdrops']) {
  // clean
  backdrops.value = []
  backdropMap.clear()

  // set
  backdrops.value = (bs ?? []).map((b) => ({ ...b }))
  backdrops.value.forEach((b: Backdrop) => backdropMap.set(b.id, b))
}

function setBackdrop(s: UpdateDto.Backdrop) {
  const backdrop = findBackdropById(s.id)

  if (backdrop) {
    updateExistBackdrop(backdrop, s)
  }
}

function updateExistBackdrop(
  backdrop: Backdrop,
  updateData: UpdateDto.Backdrop
) {
  Object.assign(backdrop, updateData)
}

function findBackdropById(id: Backdrop['id']) {
  return backdropMap.get(id)
}

function updateIsBackdrop(value: boolean) {
  isBackdrop.value = value
}

export { backdrops, initBackdrops, setBackdrop, findBackdropById, updateIsBackdrop, readonlyIsBackdrop }
