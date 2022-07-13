const tr = {
	vehicle: ['1', '2', '3'],
	source: ['s1', 's10', 's11', 's12', 's13', 's14'],
	dest: ['s1', 's10', 's11'],
}

const alarm = {
	vehicle: ['1', '2', '3'],
	point: ['1', '12', '15'],
	alarm: ['10000', '10101', '10105'],
}

const exSubfilter = {
	normaltr: tr,
	abnormaltr: tr,
	alarm: alarm,
}

export default exSubfilter
