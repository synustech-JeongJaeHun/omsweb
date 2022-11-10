import { isAfter, addSeconds, isBefore } from 'date-fns'

/**
 *
 * @param start
 * @param end
 * @param step in second
 * @returns
 */

function getTimeRangeChunks(start: Date, end: Date, step: number) {
	if (isAfter(start, end)) throw new Error('Input Error')

	let cStart = start
	let cEnd = addSeconds(cStart, step)
	const result: Date[][] = []

	while (isBefore(cStart, end)) {
		if (isAfter(cEnd, end) || cEnd.getTime() === end.getTime()) {
			result.push([cStart, end])
			break
		}
		result.push([cStart, cEnd])

		cStart = cEnd
		cEnd = addSeconds(cEnd, step)
	}
	return result
}

export { getTimeRangeChunks }
