import { CarrierFocusedObject } from './types/CarrierFocusedObject'

let carrierFocusedObject: CarrierFocusedObject | undefined = undefined

function setCarrierFocusedObject(cfo?: CarrierFocusedObject) {
  // prev
  if (carrierFocusedObject)
    carrierFocusedObject.isCarrierFocused = undefined

  // now
  if (cfo) {
    cfo.isCarrierFocused = true
    carrierFocusedObject = cfo
  }
}

export { setCarrierFocusedObject }
