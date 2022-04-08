import { FocusedObject } from './types/FocusedObject'

let focusedObject: FocusedObject | undefined = undefined

function setFocusedObject(fo?: FocusedObject) {
  // prev
  if (focusedObject) focusedObject.isFocused = undefined

  // now
  if (fo) {
    fo.isFocused = true
    focusedObject = fo
  }
}

export { setFocusedObject }
