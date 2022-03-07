import { ref, watch } from "vue";
import { TrackedObject } from "./types/TrackedObject";

const trackedObject = ref<TrackedObject>()

watch(trackedObject, (trackedObject, prevTrackedObject) => {
  if (prevTrackedObject)
    prevTrackedObject.isTracked = undefined

  if (trackedObject)
    trackedObject.isTracked = true
})

function setTrackedObject(to: TrackedObject) {
  trackedObject.value = to
}

export { setTrackedObject }