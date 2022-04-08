import { Zcu } from "../types/Zcu"

function getHumanReadableUsingType(usingType: Zcu['usingType']) {
  switch (usingType) {
    case 0:
      return "NONE"
    case 1:
      return "HW"
    case 2:
      return "SW"
  }
}

export { getHumanReadableUsingType }