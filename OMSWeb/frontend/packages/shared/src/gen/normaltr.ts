import * as R from 'ramda'
import { numRound } from '../utils/number'
import { getFixedDigitNumber } from '../utils/string'

// prettier-ignore

const dic = {
	duration: {
		label: '',
		length: 3,
		rand: [100000, 1],
	},
	vehicle: {
		label: 'VEH',
		length: 40,
		rand: [200, 1],
	},
	source: {
		label: 'PORT',
		length: 10,
		rand: [500, 1 / 3],
	},
	dest: {
		label: 'PORT1',
		length: 10,
		rand: [500, 1 / 3],
	},
}

const getRandomRound = (rand, digit = 0) => {
	const isOff = digit === 0
	return numRound(digit, isOff, Math.random() * rand)
}

const getBody = ({ variant, length, xkey, label, rand }) => {
	const arr = getFixedDigitNumber(length)

	return R.times((i) => {
		return [
			variant === 'duration' ? `${i + 1}월` : `${label}_${arr[i]}`,
			getRandomRound(rand[0]),
			getRandomRound(rand[1], 2),
		]
	}, length)
}

const genItem = (variant, opt = {}) => {
	let base = {
		variant,
		xkey: variant === 'duration' ? variant : `${variant}Name`,
	}

	const config = { ...base, ...dic[variant] }

	return getBody(config)
}

const genList = () => {
	const keys = ['duration', 'vehicle', 'source', 'dest']

	return keys.reduce((acc, key) => {
		acc[key] = genItem(key)
		return acc
	}, {})
}

const getNormaltr = ({ variant }: Props) => {
	const all = genList()
	return variant === 'duration' ? all : R.omit([variant], all)
}

interface Props {
	variant: 'duration' | 'vehicle' | 'source' | 'dest'
}

export default getNormaltr
