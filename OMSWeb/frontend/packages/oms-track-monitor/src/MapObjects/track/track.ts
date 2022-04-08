import { TrackedObject } from './types/TrackedObject'

let trackedObject: TrackedObject | undefined = undefined

function setTrackedObject(to?: TrackedObject) {
  if (trackedObject) trackedObject.isTracked = undefined

  if (to) {
    to.isTracked = true
    trackedObject = to
  }
}

export { setTrackedObject }
