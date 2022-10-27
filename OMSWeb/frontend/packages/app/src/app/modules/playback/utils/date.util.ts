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

	function recursive(start: Date, end: Date, step: number, result: [Date,Date][]): [Date,Date][] {
    return isBefore(addSeconds(start, step), end) 
      ? recursive(addSeconds(start, step), end, step, [...result, [start, addSeconds(start, step)]])
      : [...result, [start, end]]
	}

	return recursive(start, end, step, [])
}

export { getTimeRangeChunks }
