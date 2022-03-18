import { ref, watch } from "vue";
import { FocusedObject } from "./types/FocusedObject";

let focusedObject: FocusedObject | undefined = undefined

// watch(focusedObject, (focusedObject, prevFocusedObject) => {
//   if (prevFocusedObject)
//     prevFocusedObject.isFocused = undefined

//   if (focusedObject)
//     focusedObject.isFocused = true
// })

function setFocusedObject(fo?: FocusedObject) {
  const prevFocusedObject = focusedObject

  if(prevFocusedObject)
    prevFocusedObject.isFocused = undefined

  if(fo){
    fo.isFocused = true
    focusedObject = fo
    // focusedObject?.isFocused
  }
}

export { setFocusedObject }