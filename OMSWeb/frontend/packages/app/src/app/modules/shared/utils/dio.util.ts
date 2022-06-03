type Pattern =
	| 'Before Arrival'
	| 'OHT Arrival'
	| 'Transfer Start - On'
	| 'Transfer Start - Off'
	| 'Carrier Detection'
	| 'Transfer Complete'
	| 'OHT Start'
	| ''

function parsePIO(
	pi: {
		L_REQ: '0' | '1'
		U_REQ: '0' | '1'
		READY: '0' | '1'
		HO_AVBL: '0' | '1'
		ES: '0' | '1'
	},
	po: {
		VALID: '0' | '1'
		CS_0: '0' | '1'
		CS_1: '0' | '1'
		TR_REQ: '0' | '1'
		BUSY: '0' | '1'
		COMPT: '0' | '1'
	},
): Pattern {
	const pattern =
		pi.L_REQ +
		pi.U_REQ +
		pi.READY +
		pi.HO_AVBL +
		pi.ES +
		po.VALID +
		po.CS_0 +
		po.CS_1 +
		po.TR_REQ +
		po.BUSY +
		po.COMPT

	switch (pattern) {
		case '00011000000':
			return 'Before Arrival'
		case '00011010000':
			return 'OHT Arrival'
		case '10111110110':
			return 'Transfer Start - On'
		case '01111110110':
			return 'Transfer Start - Off'
		case '00111110110':
			return 'Carrier Detection'
		case '00111110100':
			return 'Transfer Complete'
		case '00011000000':
			return 'OHT Start'

		default:
			return ''
	}
}

function convertPatternToColor(pattern: Pattern) {
	switch (pattern) {
		case 'Before Arrival':
			return 'indianred'
		case 'OHT Arrival':
			return 'rosybrown'
		case 'Transfer Start - On':
			return 'darkorange'
		case 'Transfer Start - Off':
			return 'gold'
		case 'Carrier Detection':
			return 'lime'
		case 'Transfer Complete':
			return 'blueviolet'
		case 'OHT Start':
			return 'blue'

		default:
			return 'rgba(0,0,0,0)'
	}
}

/**
 * Parsing rule: right bit first, left bit last
 *
 * @param value
 * @param bitLength
 * @returns string
 */
function convertSignedIntegerToBitString(
	value: number,
	bitLength: number,
): string {
	const absoluteValue = Math.abs(value)

	const data = [...Array(bitLength).keys()].map((index) => {
		const bit = (absoluteValue >> index) & 1
		return String(bit)
	})

	if (value < 0) data[data.length - 1] = '1'

	return data.join('')
}

export { convertSignedIntegerToBitString, parsePIO, convertPatternToColor }
