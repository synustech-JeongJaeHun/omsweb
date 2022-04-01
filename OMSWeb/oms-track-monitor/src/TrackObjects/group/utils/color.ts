import { Color } from 'src/types/Color'
import { Group } from '../types/Group'

/**
 * apply rgba alpha
 */
function getGroupColorWithAlpha(color: Group['color']) {
  return `${Color[color]}30`
}

export { getGroupColorWithAlpha }
