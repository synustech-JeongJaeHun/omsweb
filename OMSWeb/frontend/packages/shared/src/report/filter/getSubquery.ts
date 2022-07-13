const exSubquery = {}

const getSubquery = (variant) => {
	switch (variant) {
		case 'normaltr':
		case 'abnormaltr':
			return {
				vehicle: [1, 2, 3],
				source: ['s1', 's10', 's11', 's12', 's13', 's14'],
				dest: ['s1', 's10', 's11'],
			}
		default:
			return {
				vehicle: [1, 2, 3],
				point: [1, 12, 15, 16],
				alarm: [10000, 10101, 10105],
			}
	}
}

export default getSubquery
