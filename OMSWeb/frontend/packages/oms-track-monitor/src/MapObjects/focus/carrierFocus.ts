import { CarrierFocusedObject } from './types/CarrierFocusedObject'

let carrierFocusedObject: CarrierFocusedObject | undefined = undefined

function setCarrierFocusedObject(cfo?: CarrierFocusedObject) {
  // prev
  if (carrierFocusedObject) carrierFocusedObject.isFocused = undefined

  // now
  if (cfo) {
    cfo.isFocused = true
    carrierFocusedObject = cfo
  }
}

export { setCarrierFocusedObject }
