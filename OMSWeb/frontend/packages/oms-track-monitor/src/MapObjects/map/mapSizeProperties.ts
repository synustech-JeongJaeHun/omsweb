import { computed, reactive, readonly } from 'vue'

const mapSizeProperties = reactive({
	minX: 0,
	minY: 0,
	maxX: 1000,
	maxY: 1000,
})

function initMapSizeProperties(
	minX: number,
	minY: number,
	maxX: number,
	maxY: number
) {
	mapSizeProperties.minX = minX
	mapSizeProperties.minY = minY
	mapSizeProperties.maxX = maxX
	mapSizeProperties.maxY = maxY
}

const mapSizePropertiesInfo = readonly(
	computed(() => {
		const width = mapSizeProperties.maxX - mapSizeProperties.minX,
			height = mapSizeProperties.maxY - mapSizeProperties.minY

		const baseLength = Math.max(
			width,
			height,
			(width + height) / Math.pow(8, 1 / 2)
		)

		return {
			...mapSizeProperties,
			centerX: (mapSizeProperties.maxX + mapSizeProperties.minX) / 2,
			centerY: (mapSizeProperties.maxY + mapSizeProperties.minY) / 2,
			width,
			height,
			baseLength,
		}
	})
)

export { initMapSizeProperties, mapSizePropertiesInfo }
