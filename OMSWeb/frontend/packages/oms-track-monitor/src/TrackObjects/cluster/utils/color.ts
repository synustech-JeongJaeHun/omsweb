import { Color } from 'src/types/Color'
import { Cluster } from '../types/Cluster'

/**
 * apply rgba alpha 50%
 */
function getClusterColorWithAlpha(color: Cluster['color']) {
  return `${Color[color]}45`
}

export { getClusterColorWithAlpha }
