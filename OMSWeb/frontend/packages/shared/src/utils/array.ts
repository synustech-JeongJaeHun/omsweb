import * as R from 'ramda'

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
