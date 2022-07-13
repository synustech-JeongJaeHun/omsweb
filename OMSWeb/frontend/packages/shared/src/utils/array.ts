import * as R from 'ramda'
import { isType } from './common'

export const omitArray = (wishKeys, refKeys, arr) => {
	const doOmit = (_wishKeys, _refKeys, _arr) => {
		if (_wishKeys.length > 0) {
			const key = R.head(_wishKeys)
			const idx = R.indexOf(key, _refKeys)
			_arr = R.remove(idx, 1, _arr)
			_refKeys = R.remove(idx, 1, _refKeys)
			_wishKeys = R.remove(0, 1, _wishKeys)

			return doOmit(_wishKeys, _refKeys, _arr)
		} else {
			return _arr
		}
	}

	return doOmit(wishKeys, refKeys, arr)
}

export const getArrayType = (arr) => {
	const ret = arr.map(isType)
	const uniqList = R.uniq(ret)

	return uniqList.length === 1 ? R.head(uniqList) : 'mixed'
}

type sort = (direction: 'ascend' | 'descend', arr: any[]) => any[]
export const sort = R.curryN(2, (direction = 'ascend', arr): sort => {
	const arrType = getArrayType(arr)

	const getCompare = () => {
		switch (arrType) {
			case 'number':
				return (a, b) => (direction === 'ascend' ? a - b : b - a)
			case 'string':
				return (a, b) =>
					direction === 'ascend' ? a.localeCompare(b) : b.localeCompare(a)
			default:
				return arr
		}
	}

	return R.sort(getCompare(), arr)
})
