/* eslint-disable no-plusplus */
/* eslint-disable import/prefer-default-export */
import * as R from 'ramda'

export function makeid(length: number): string {
	let result = ''
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	const charactersLength = characters.length
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

export const camelize = (text) => {
	text = text.replace(/[-_//\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
	return text.substr(0, 1).toLowerCase() + text.substr(1)
}

export const getFixedDigitNumber = (targetLength) => {
	let { length } = R.toString(targetLength)
	const digit = length + 1
	const str = R.compose(R.join(''), R.repeat('0'))(digit)

	return R.times((i) => {
		i = i + 1
		const temp = str + R.toString(i)
		return temp.slice(digit * -1)
	}, targetLength)
}
