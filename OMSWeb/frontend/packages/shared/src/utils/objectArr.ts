import * as R from 'ramda'
import { sort } from './array'

export function isSameObjArr(a, b) {
	const arrs = [a, b]
	const [keysA, keysB] = R.map(R.compose(sort('ascend'), R.keys))(arrs)

	if (keysA.length === keysB.length) {
		if (R.equals(keysA, keysB)) {
			const list = keysA.reduce((acc, key) => {
				const itemA = a[key]
				const itemB = b[key]
				const isItemSame = R.equals(itemA, itemB)
				acc.push(isItemSame)

				return acc
			}, [])

			const allPass = list.every((bool) => bool === true)

			if (allPass) return true

			return false
		}

		return false
	}

	return false
}
