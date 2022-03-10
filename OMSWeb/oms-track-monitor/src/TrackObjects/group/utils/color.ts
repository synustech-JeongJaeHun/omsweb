import { Color } from "src/types/Color"
import { Group } from "../types/Group"

/**
* apply rgba alpha 50%
*/
function getGroupColorWithAlpha(color: Group['color']) {
  return `${Color[color]}80`
}

export { getGroupColorWithAlpha }