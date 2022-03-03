import { ref, watch } from "vue";
import { FocusedObject } from "./types/FocusedObject";

const focusedObject = ref<FocusedObject>()

watch(focusedObject, (focusedObject, prevFocusedObject) => {
  if (prevFocusedObject)
    prevFocusedObject.isFocused = undefined

  if (focusedObject)
    focusedObject.isFocused = true
})

function setFocusedObject(fo: FocusedObject) {
  focusedObject.value = fo
}

export { setFocusedObject }