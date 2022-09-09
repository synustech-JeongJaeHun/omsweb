import { Dto } from '@oms/root/models/dto/track.model'
import { TrackMonitorSettingService } from '@oms/root/services/track-monitor-setting.service'
import { main_css } from '../../shared/utils/css-loader'

export namespace SvgDrawingUtil {
	export const buildVehicleUnit = (
		data: any,
		svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
		className: string,
		dom_css: any,
		zoom_level: number,
		group_type: string,
		is_zoom_only: boolean,
		options: any = {},
		trackMonitorSetting: TrackMonitorSettingService['trackSetting'],
	) => {
		const mainUnit = svg
			.append('g')
			.attr('class', `vehicle-unit ${className}`)
			.attr('id', `id_${data.id}`)
			.attr('x', 0)
			.attr('y', 0)
			.attr('transform', `translate(0, 0)`)

		buildSubUnit(
			'VEHICLE',
			mainUnit,
			data,
			dom_css,
			zoom_level,
			group_type,
			null,
			options,
			trackMonitorSetting,
		)
	}

	export const buildUnit = (
		object_type: string,
		data: any,
		svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
		className: string,
		dom_css: any,
		zoom_level: number,
		group_type: string,
		is_zoom_only: boolean,
		options: any = {},
		trackMonitorSetting: TrackMonitorSettingService['trackSetting'],
	) => {
		let mainUnit: any
		switch (object_type) {
			case 'POINT':
				mainUnit = svg
					.append('g')
					.attr('class', `point-unit ${className}`)
					.attr('id', `id_${data.id}`)
					.attr('x', data.x)
					.attr('y', data.y)

				if (zoom_level === 2) {
					buildSubUnit(
						'POINT',
						mainUnit,
						data,
						dom_css,
						zoom_level,
						group_type,
						null,
						options,
						trackMonitorSetting,
					)
				} else if (zoom_level === 3) {
					buildSubUnit(
						'POINT',
						mainUnit,
						data,
						dom_css,
						zoom_level,
						group_type,
						null,
						options,
						trackMonitorSetting,
					)
					buildSubUnit(
						'POINT_LABEL',
						mainUnit,
						data,
						dom_css,
						zoom_level,
						group_type,
						null,
						options,
						trackMonitorSetting,
					)
				}
				break
			case 'STATION':
				mainUnit = svg
					.append('g')
					.attr('class', `station-unit ${className}`)
					.attr('id', `id_${data.id}`)
					.attr('x', 0)
					.attr('y', 0)
					.attr('transform', `translate(0, 0)`)

				buildSubUnit(
					'STATION',
					mainUnit,
					data,
					dom_css,
					zoom_level,
					group_type,
					null,
					options,
					trackMonitorSetting,
				)
				mainUnit
					.select('.station_path')
					.attr('d', dom_css.icon_level3)
					.attr('level', 'level3')
				mainUnit
					.select('.station_mask')
					.attr('d', dom_css.icon_level3)
					.attr('level', 'level3')

				buildSubUnit(
					'STATION_DETAIL',
					mainUnit,
					data,
					dom_css,
					zoom_level,
					group_type,
					null,
					options,
					trackMonitorSetting,
				)

				break
			case 'BUFFER':
				mainUnit = svg
					.append('g')
					.attr('class', `buffer-unit ${className}`)
					.attr('id', `id_${data.id}`)
					.attr('x', 0)
					.attr('y', 0)
					.attr('transform', `translate(0, 0)`)

				buildSubUnit(
					'BUFFER',
					mainUnit,
					data,
					dom_css,
					zoom_level,
					group_type,
					null,
					options,
					trackMonitorSetting,
				)
				mainUnit
					.select('.buffer_path')
					.attr('d', dom_css.icon_level3)
					.attr('level', 'level3')
				mainUnit
					.select('.buffer_mask')
					.attr('d', dom_css.icon_level3)
					.attr('level', 'level3')
				buildSubUnit(
					'BUFFER_DETAIL',
					mainUnit,
					data,
					dom_css,
					zoom_level,
					group_type,
					null,
					options,
					trackMonitorSetting,
				)
				break
			case 'MTL':
				mainUnit = svg
					.append('g')
					.attr('class', `mtl-unit ${className}`)
					.attr('id', `id_${data.id}`)
					.attr('x', 0)
					.attr('y', 0)
					.attr('transform', `translate(0, 0) scale(0.1)`)

				buildSubUnit(
					'MTL',
					mainUnit,
					data,
					dom_css,
					zoom_level,
					group_type,
					null,
					options,
					trackMonitorSetting,
				)
				mainUnit
					.select('.mtl_path')
					.attr('d', dom_css.icon_level3)
					.attr('level', 'level3')
				mainUnit
					.select('.mtl_mask')
					.attr('d', dom_css.icon_level3)
					.attr('level', 'level3')
				buildSubUnit(
					'MTL_DETAIL',
					mainUnit,
					data,
					dom_css,
					zoom_level,
					group_type,
					null,
					options,
					trackMonitorSetting,
				)
				break
			default:
				break
		}
	}

	export const buildSubUnit = (
		object_type: string,
		dom_object_group: any,
		layout_object: any,
		dom_css: any,
		zoom_level: number = 3,
		group_type: string,
		group_colors: any,
		options: any = {},
		trackMonitorSetting: TrackMonitorSettingService['trackSetting'],
	) => {
		const overlap_adjustment = true
		const offset_multiplier = zoom_level / 3
		const { mapRotation = 0, vehicleScale = 1 } = options

		switch (object_type) {
			case 'POINT':
				dom_object_group
					.append('circle')
					.attr('fill', trackMonitorSetting.pointColor)
					.attr('r', main_css.point.radius)
					.attr('cx', 0)
					.attr('cy', 0)

				if (overlap_adjustment) {
					dom_object_group
						.append('rect')
						.attr('class', 'point_mask')
						.attr('fill', 'transparent')
						.attr('x', 0)
						.attr('y', 0)
						.attr('width', 20)
						.attr('height', 20)
				} else {
					dom_object_group
						.append('circle')
						.attr('class', 'point_mask')
						.attr('fill', 'transparent')
						.attr('r', main_css.general.mask_weight / 2)
						.attr('cx', 0)
						.attr('cy', 0)
				}
				break
			case 'POINT_LABEL':
				dom_object_group
					.append('text')
					.attr('class', 'label')
					.attr('id', function () {
						let id = layout_object.logicalId
							? layout_object.logicalId
							: layout_object.id
						return `id_${id}`
					})
					.attr('font-size', `${dom_css.label_font_size}px`)
					.attr('x', function () {
						if (overlap_adjustment) {
							return dom_css.label_offset * 2
						} else {
							return dom_css.label_offset
						}
					})
					.attr('y', function () {
						if (overlap_adjustment) {
							return dom_css.label_font_size / 2
						} else {
							return dom_css.label_font_size / 2
						}
					})
					.text(function () {
						let id = layout_object.logicalId
							? layout_object.logicalId
							: layout_object.id
						if (overlap_adjustment) {
							return `Point ${id}`
						} else {
							return `${id}`
						}
					})
				break
			case 'VEHICLE':
				// Add group id group
				if (group_colors) {
					if (layout_object.group) {
						let group_svg = dom_object_group.select('.group_svg')
						let group_size = main_css.group.vehicle_group_size
						if (group_svg.nodes().length === 0) {
							dom_object_group
								.append('rect')
								.attr('class', 'group_svg')
								.attr('x', -group_size * 2)
								.attr('y', -group_size * 2)
								.attr('rx', group_size)
								.attr('ry', group_size)
								.attr('width', group_size * 4)
								.attr('height', group_size * 4)
								.attr('fill', 'none')
								.attr('stroke', group_colors[layout_object.group])
								.attr('stroke-width', '3px')
								.attr('transform', () => {
									if (!overlap_adjustment)
										return `rotate(${-mapRotation})scale(${vehicleScale})`
									else return ''
								})
								.style('opacity', main_css.group.opacity)
								.lower()
						}
					}
				}

				// Outter stroke for appearance quality
				if (layout_object.type === 'STANDARD') {
					dom_object_group
						.append('circle')
						.attr('class', 'outline')
						.attr('r', dom_css.radius)
						.attr('cx', 0)
						.attr('cy', 0)
						.attr('fill', 'none')
						.attr('stroke', 'black')
						.attr('stroke-width', dom_css.line_weight + 2)
						.attr('transform', () => {
							if (!overlap_adjustment) return `scale(${vehicleScale})`
							else return ''
						})

					// Main Element SVG
					dom_object_group
						.append('circle')
						.attr('class', 'vehicle_circle')
						.attr('r', dom_css.radius)
						.attr('cx', 0)
						.attr('cy', 0)
						.attr('fill', 'none')
						.attr('stroke', function () {
							const vehicleMode = getVehicleComplicatedMode(layout_object)
							const color = getVehicleColorFromComplicatedMode(
								trackMonitorSetting,
								vehicleMode,
							)

							return color
						})
						.attr('stroke-width', dom_css.line_weight)
						.attr('transform', () => {
							if (!overlap_adjustment) return `scale(${vehicleScale})`
							else return ''
						})

					// Add clean dashed line
				}

				// if (layout_object.isStale) {
				// 	dom_object_group
				// 		.append('g')
				// 		.attr('class', 'stale')
				// 		.attr('transform', () => {
				// 			if (!overlap_adjustment)
				// 				return `rotate(${-mapRotation})translate(${
				// 					dom_css.radius * 2 * vehicleScale
				// 				},-${dom_css.radius * vehicleScale})scale(${vehicleScale})`
				// 			else return `translate(${dom_css.radius * 2},-${dom_css.radius})`
				// 		})
				// 	let stale_element = dom_object_group.select('g.stale')
				// 	stale_element
				// 		.append('circle')
				// 		.attr('cx', 0)
				// 		.attr('cy', 0)
				// 		.attr('r', 5.5)
				// 		.attr('fill', 'white')
				// 	stale_element
				// 		.append('path')
				// 		.attr('d', dom_css.stale_path)
				// 		.attr('fill', 'black')
				// 		.attr('transform', 'translate(-6.5,-6.5)scale(0.013)')
				// }

				// Unload/load fail
				if (layout_object.cargoTransferResult) {
					dom_object_group
						.append('g')
						.attr('class', 'fail')
						.attr('transform', () => {
							return 'translate(-6 -6)'
						})
						.append('path')
						.attr('d', dom_css.fail_path)
						.attr('transform', 'scale(0.025)')
				}

				// Prevent push
				if (!layout_object.isMaint && !layout_object.canBePushed) {
					let push_svg = dom_object_group
						.append('g')
						.attr('class', 'push')
						.attr('transform', () => {
							if (!overlap_adjustment)
								return `rotate(${-mapRotation})translate(${
									((dom_css.radius * 4) / 3) * vehicleScale
								},${dom_css.radius * vehicleScale})scale(${vehicleScale})`
							else
								return `translate(${(dom_css.radius * 4) / 3},${
									dom_css.radius
								})`
						})
					push_svg
						.append('circle')
						.attr('r', 4.5)
						.attr('cx', 6)
						.attr('cy', 0)
						.attr('fill', 'white')
						.attr('stroke', 'red')
						.attr('stroke-with', 20)
					push_svg
						.append('line')
						.attr('x1', 5.3)
						.attr('y1', -2.0)
						.attr('x2', 5.3)
						.attr('y2', 3.5)
						.attr('stroke', 'black')
						.attr('stroke-width', 1.5)
					push_svg
						.append('path')
						.attr('d', 'M 5.3 -2.0 A 1.9 1.3 0 1 1 5.3 0 Z')
						.attr('stroke', 'black')
						.attr('stroke-width', 1.5)
						.attr('fill', 'none')
				} else {
					dom_object_group.select('.push').remove()
				}

				// Prevent call
				if (!layout_object.isMaint && getIsVehicleTransferDisabled(layout_object.orderOrigin)) {
					let push_svg = dom_object_group.select('.push')
					let x_offset = (dom_css.radius * 4) / 3
					if (push_svg.nodes().length > 0) {
						x_offset = dom_css.radius * 3
					}
					let call_svg = dom_object_group
						.append('g')
						.attr('class', 'call')
						.attr('transform', () => {
							if (!overlap_adjustment)
								return `rotate(${-mapRotation})translate(${
									x_offset * vehicleScale
								},${dom_css.radius * vehicleScale})scale(${vehicleScale})`
							else return `translate(${x_offset},${dom_css.radius})`
						})

					call_svg
						.append('circle')
						.attr('r', 4.5)
						.attr('cx', 6)
						.attr('cy', 0)
						.attr('fill', 'white')
						.attr('stroke', 'red')
						.attr('stroke-with', 20)
					call_svg
						.append('line')
						.attr('x1', 3.5)
						.attr('y1', -2.0)
						.attr('x2', 8.5)
						.attr('y2', -2.0)
						.attr('stroke', 'black')
						.attr('stroke-width', 1.5)
					call_svg
						.append('line')
						.attr('x1', 6.0)
						.attr('y1', -2.0)
						.attr('x2', 6.0)
						.attr('y2', 3.5)
						.attr('stroke', 'black')
						.attr('stroke-width', 1.5)
				} else {
					dom_object_group.select('.call').remove()
				}

				dom_object_group
					.append('text')
					.attr('class', 'label')
					.attr('id', function () {
						return `id_${layout_object.id}`
					})
					.attr('font-size', `${dom_css.font_size}px`)
					.attr('display', () => {
						if (vehicleScale >= 0.6) {
							return 'block'
						}
						return 'none'
					})
					.attr('x', () => {
						let x = (-dom_css.text_offset * 3) / 4
						if (overlap_adjustment) {
							return dom_css.text_offset * 2
						} else {
							if (vehicleScale >= 0.6) {
								x *= vehicleScale
							}
						}

						return x
					})
					.attr('y', () => {
						let y = -dom_css.radius / 2
						if (overlap_adjustment) {
							return -dom_css.radius / 3
						} else {
							if (vehicleScale >= 0.6) {
								y *= vehicleScale
							}
						}

						return y
					})
					.html(function () {
						let id = layout_object.logicalId
							? layout_object.logicalId
							: layout_object.id
						if (overlap_adjustment) {
							return `Vehicle ${id}`
						} else {
							return id
						}
					})
					.attr('text-anchor', function () {
						if (overlap_adjustment) {
							return 'start'
						} else {
							return 'end'
						}
					})
					.attr('transform', () => {
						if (!overlap_adjustment) return `rotate(${-mapRotation})`
						else return ''
					})

				if (layout_object.hotlot) {
					dom_object_group
						.append('rect')
						.attr('class', 'hotlot')
						.attr('display', () => {
							if (vehicleScale >= 0.6 || overlap_adjustment) {
								return 'block'
							} else {
								return 'none'
							}
						})
						.attr('fill', function () {
							return dom_css.color_hotlot
						})
						.attr('x', () => {
							return (
								-((dom_css.text_offset * 3) / 4) *
									(overlap_adjustment ? vehicleScale : 1) -
								layout_object.orderId.toString().length * 6
							)
							// return -(layout_object.orderId.toString().length * 6 + parseInt(dom_css.text_offset) - 5)
						})
						.attr('y', () => {
							return (
								(dom_css.radius * 2 - dom_css.radius / 2) *
									(overlap_adjustment ? vehicleScale : 1) -
								10
							)
						})
						.attr('width', () => {
							return `${layout_object.orderId.toString().length * 6}px`
						})
						.attr('height', 13)
						.attr('rx', 5)
						.attr('ry', 5)
						.attr('transform', () => {
							if (!overlap_adjustment) return `rotate(${-mapRotation})`
							else return ''
						})
						.lower()
				}

				dom_object_group
					.append('text')
					.attr('class', 'label_order')
					.attr('display', () => {
						if (vehicleScale >= 0.6 || overlap_adjustment) {
							return 'block'
						} else {
							return 'none'
						}
					})
					.attr('font-size', `${dom_css.font_size}px`)
					.attr(
						'fill',
						layout_object.hotlot
							? dom_css.label_hotlot_color
							: dom_css.label_color,
					)
					.attr('x', () => {
						let x = (-dom_css.text_offset * 3) / 4
						if (overlap_adjustment) {
							x = dom_css.text_offset * 2
						} else {
							if (vehicleScale >= 0.6) {
								x *= vehicleScale
							}
						}
						return x
					})
					.attr('y', () => {
						let y = dom_css.radius * 2 - dom_css.radius / 2
						if (overlap_adjustment) {
							y = dom_css.radius * 2 - dom_css.radius / 2
						} else {
							if (vehicleScale >= 0.6) {
								y *= vehicleScale
							}
						}
						return y
					})
					.html(function () {
						if (overlap_adjustment) {
							if (layout_object.orderId) {
								return `Order: ${layout_object.orderId}`
							} else {
								return 'Order: None'
							}
						} else {
							if (layout_object.orderId) {
								return `${layout_object.orderId}`
							} else {
								return ''
							}
						}
					})
					.attr('text-anchor', function () {
						if (overlap_adjustment) {
							return 'start'
						} else {
							return 'end'
						}
					})
					.attr('transform', () => {
						if (!overlap_adjustment) return `rotate(${-mapRotation})`
						else return ''
					})

				if (
					layout_object.cargoState === 'F' ||
					layout_object.cargoState === 'U' ||
					layout_object.cargoState === 'L'
				) {
					const foup = dom_object_group
						.append('circle')
						.attr('r', 5)
						.attr('cx', '0')
						.attr('cy', '0')
						.attr('stroke-width', 1)
						.attr('stroke', 'white')
						.attr('fill', function () {
							if (layout_object.cargoState === 'F') {
								return trackMonitorSetting.cargoFullColor
							} else if (layout_object.cargoState === 'L') {
								return trackMonitorSetting.cargoLoadingColor
							} else {
								return trackMonitorSetting.cargoUnloadingColor
							}
						})
						// .attr('class', function () {
						//   if (layout_object.cargoState === 'F') {
						//     return 'foup loaded';
						//   } else if (layout_object.cargoState === 'L') {
						//     return 'foup loading';
						//   } else {
						//     return 'foup unloading';
						//   }
						// })
						.attr('transform', () => {
							if (!overlap_adjustment) return `scale(${vehicleScale})`
							else return ''
						})
						.lower()

					if (layout_object.cargoState === 'F') {
					} else if (layout_object.cargoState === 'L') {
						//  <animate attributeName="r" values="0;40" dur="1s" repeatCount="indefinite" />
						foup
							.append('animate')
							.attr('attributeName', 'r')
							.attr('values', '0;5')
							.attr('dur', '1s')
							.attr('repeatCount', 'indefinite')
					} else {
						foup
							.append('animate')
							.attr('attributeName', 'r')
							.attr('values', '5;0')
							.attr('dur', '1s')
							.attr('repeatCount', 'indefinite')
					}
				} else {
					dom_object_group.select('.foup').remove()
				}

        if (layout_object.isMaint === true) {
					dom_object_group
						.append('path')
            .attr('class', 'maint')
						.attr('d', 'M 21.910031,9.9058058 18.623202,4.6532395 C 19.293898,3.6712949 19.350918,2.3504581 18.66466,1.2537685 17.942279,0.09935804 16.57789,-0.41234238 15.333009,-0.15544309 L 16.886124,2.3265374 15.15451,3.4101062 13.554472,0.91732788 C 12.732217,1.9137925 12.642794,3.3753866 13.365173,4.5297964 c 0.686257,1.0966925 1.899089,1.622908 3.075449,1.449048 l 3.286829,5.2525656 c 0.144476,0.230878 0.425994,0.295685 0.656874,0.151212 L 21.7119,10.551886 c 0.277801,-0.133677 0.353407,-0.462113 0.198124,-0.6460751 z')
						.attr('fill', 'var(--highlight-select-color)')
				} else {
					dom_object_group.select('.maint').remove()
				}

				if (layout_object.isSensorStopped === true) {
					dom_object_group
						.append('text')
						.attr('class', 'corner')
						.attr('x', 12)
						.attr('y', -8)
						.attr('font-weight', 'bold')
						.attr('font-size', 'small')
						.attr('transform', () => {
							if (!overlap_adjustment)
								return `rotate(${-mapRotation})scale(${vehicleScale})`
							else return ''
						})
						.html('S')
				} else {
					dom_object_group.select('.corner').remove()
				}

				if (layout_object.isZcuBlocked === true) {
					dom_object_group
						.append('text')
						.attr('class', 'corner')
						.attr('x', 12)
						.attr('y', -8)
						.attr('font-weight', 'bold')
						.attr('font-size', 'small')
						.attr('transform', () => {
							if (!overlap_adjustment)
								return `rotate(${-mapRotation})scale(${vehicleScale})`
							else return ''
						})
						.html('Z')
				} else {
					dom_object_group.select('.block').remove()
				}
				// if (layout_object.isBlocked === true) {
				// 	dom_object_group
				// 		.append('circle')
				// 		.attr('class', 'block')
				// 		.attr('r', dom_css.blocked_radius)
				// 		.attr('cx', -(2 + dom_css.radius + dom_css.blocked_radius / 2))
				// 		.attr('cy', -(2 + dom_css.radius + dom_css.blocked_radius / 2))
				// 		.attr('fill', dom_css.color_blocked)
				// 		.attr('transform', () => {
				// 			if (!overlap_adjustment)
				// 				return `rotate(${-mapRotation})scale(${vehicleScale})`
				// 			else return ''
				// 		})
				// } else {
				// 	dom_object_group.select('.block').remove()
				// }

				// if (layout_object.errorList != 0) {
				// 	dom_object_group
				// 		.append('path')
				// 		.attr('class', 'error')
				// 		.attr('d', dom_css.icon_error)
				// 		.attr('fill', function () {
				// 			return dom_css.color_mode_error
				// 		})
				// 		.attr('stroke', function () {
				// 			return dom_css.color_mode_error_outline
				// 		})
				// 		.attr('stroke-width', `${dom_css.line_weight / 3}px`)
				// 		.attr('transform', () => {
				// 			if (!overlap_adjustment)
				// 				return `rotate(${-mapRotation})scale(${vehicleScale})`
				// 			else return ''
				// 		})
				// } else {
				// 	dom_object_group.select('.error').remove()
				// }

				if (overlap_adjustment) {
					dom_object_group
						.append('rect')
						.attr('class', 'vehicle_mask')
						.attr('fill', 'transparent')
						.attr('x', 0)
						.attr('y', 0)
						.attr('width', 20)
						.attr('height', 20)
				} else {
					dom_object_group
						.append('circle')
						.attr('class', 'vehicle_mask')
						.attr('r', dom_css.radius)
						.attr('cx', 0)
						.attr('cy', 0)
						.attr('fill', 'none')
						.attr('stroke', 'transparent')
						.attr('stroke-width', dom_css.mask_weight)
						.attr('transform', `scale(${vehicleScale})`)
				}
				break
			case 'STATION':
				dom_object_group
					.append('path')
					// .attr('class', 'station_path')
					.attr('fill', 'none')
					.attr(
						'stroke',
						layout_object.unuse
							? trackMonitorSetting.stationDisabledColor
							: trackMonitorSetting.stationColor,
					)
					.attr('stroke-width', '5px')
					.attr('level', `level${zoom_level}`)
					.attr('d', main_css.station[`icon_level${zoom_level}`])

				dom_object_group
					.append('rect')
					.attr('class', 'station_mask')
					.attr('fill', 'transparent')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', 20)
					.attr('height', 20)
				break
			case 'STATION_DETAIL':
				let label_svg = dom_object_group
					.append('text')
					.attr('class', 'label')
					.attr('font-size', `${dom_css.font_size}px`)
					.attr('x', function () {
						if (overlap_adjustment) {
							return dom_css.text_offset * 2
						} else {
							return dom_css.text_offset
						}
					})
					.attr('y', function () {
						if (overlap_adjustment) {
							return dom_css.font_size / 2
						} else {
							return dom_css.width / 2
						}
					})
					.text(function () {
						let id = layout_object.logicalId
							? layout_object.logicalId
							: layout_object.id
						if (overlap_adjustment) {
							return `Station ${id}`
						} else {
							return id
						}
					})
					.attr('text-anchor', 'start')
				break
			case 'BUFFER':
				if (zoom_level === 1) {
					dom_object_group
						.append('circle')
						// .attr('class', 'buffer_path')
						.attr('fill', trackMonitorSetting.bufferColor)
						.attr('stroke-width', '0px')
						.attr('level', `level${zoom_level}`)
						.attr('transform', `rotate(${-mapRotation})`)

					dom_object_group
						.append('circle')
						.attr('class', 'buffer_mask')
						.attr('level', `level${zoom_level}`)
						.attr('transform', `rotate(${-mapRotation})`)
				} else {
					if (overlap_adjustment) {
						// only when going into overlap or floating module at level 3
						dom_object_group
							.append('path')
							// .attr('class', 'buffer_path')
							.attr(
								'fill',
								layout_object.unuse
									? trackMonitorSetting.bufferDisabledColor
									: trackMonitorSetting.bufferColor,
							)
							.attr('stroke-width', '0px')
							.attr('level', `level${zoom_level}`)
							.attr('d', main_css.buffer[`icon_level${zoom_level}`])

						if (layout_object.carrierId)
							dom_object_group
								.append('circle')
								.attr('r', 9)
								.attr('fill', trackMonitorSetting.cargoFullColor)

						dom_object_group
							.append('rect')
							.attr('class', 'buffer_mask')
							.attr('fill', 'transparent')
							.attr('x', 0)
							.attr('y', 0)
							.attr('width', 20)
							.attr('height', 20)
					} else {
						dom_object_group
							.append('path')
							// .attr('class', 'buffer_path')
							.attr(
								'fill',
								layout_object.unuse
									? trackMonitorSetting.bufferDisabledColor
									: trackMonitorSetting.bufferColor,
							)
							.attr('stroke-width', '0px')
							.attr('level', `level${zoom_level}`)
							.attr('d', main_css.buffer[`icon_level${zoom_level}`])
							.attr(
								'transform',
								`translate(${
									layout_object.directionOffset.x * offset_multiplier
								}, ${
									layout_object.directionOffset.y * offset_multiplier
								})rotate(${-mapRotation})`,
							)
						dom_object_group
							.append('path')
							.attr('class', 'buffer_mask')
							.attr('level', `level${zoom_level}`)
							.attr('d', main_css.buffer[`icon_level${zoom_level}`])
							.attr(
								'transform',
								`translate(${
									layout_object.directionOffset.x * offset_multiplier
								}, ${
									layout_object.directionOffset.y * offset_multiplier
								})rotate(${-mapRotation})`,
							)
					}
				}
				break
			case 'BUFFER_DETAIL':
				dom_object_group
					.append('text')
					.attr('class', 'label')
					.attr('font-size', `${dom_css.font_size}px`)
					.attr('x', function () {
						if (overlap_adjustment) {
							return dom_css.text_offset * 2
						} else {
							return dom_css.text_offset
						}
					})
					.attr('y', function () {
						if (overlap_adjustment) {
							return 0
						} else {
							return dom_css.width / 2
						}
					})
					.text(function () {
						let id = layout_object.logicalId
							? layout_object.logicalId
							: layout_object.id
						if (overlap_adjustment) {
							return `Buffer ${id}`
						} else {
							return id
						}
					})
					.attr('text-anchor', 'start')

				break
			case 'MTL':
				dom_object_group
					.append('path')
					.attr('d', main_css.mtl[`icon_level${zoom_level}`])
					.attr('class', 'mtl_path')
					.attr('level', `level${zoom_level}`)
					.attr(
						'stroke',
						layout_object.unuse
							? trackMonitorSetting.mtlUnuseColor
							: trackMonitorSetting.mtlUseColor,
					)

				if (overlap_adjustment) {
					dom_object_group
						.append('rect')
						.attr('class', 'mtl_mask')
						.attr('fill', 'transparent')
						.attr('x', 0)
						.attr('y', 0)
						.attr('width', 20)
						.attr('height', 20)
				} else {
					dom_object_group
						.append('path')
						.attr('class', 'mtl_mask')
						.attr('d', main_css.mtl[`icon_level${zoom_level}`])
						.attr('level', `level${zoom_level}`)
						.attr('stroke', 'transparent')
						.attr('stroke-width', main_css.general.mask_weight / 2)
						.attr('fill', 'none')
				}
				break
			case 'MTL_DETAIL':
				dom_object_group
					.append('text')
					.attr('class', 'label')
					.attr('font-size', `${dom_css.font_size}px`)
					.attr('x', function () {
						if (overlap_adjustment) {
							return dom_css.text_offset * 2
						} else {
							return dom_css.text_offset
						}
					})
					.attr('y', function () {
						if (overlap_adjustment) {
							return 0
						} else {
							return dom_css.width / 2
						}
					})
					.attr('text-anchor', 'start')
					.text(function () {
						let id = layout_object.logicalId
							? layout_object.logicalId
							: layout_object.id
						if (overlap_adjustment) {
							return `MTL ${id}`
						} else {
							return id
						}
					})
				break
			default:
				break
		}
	}
}

/**
 * check frontend/packages/oms-track-monitor/src/TrackObjects/vehicle/components/ChjsVehicle.ce.vue
 */
function getVehicleComplicatedMode(vehicle: Dto.IVehicle) {
	if (vehicle.isConnected !== true) return 'DISCONNECT'
	if (vehicle.errorList) return 'ERROR'
	if (vehicle.isMaint) return 'MAINTENANCE'
	if (vehicle.mode === 'M') return 'MANUAL'
	if (vehicle.isSensorStopped) return 'SENSORSTOPPED'
	if (vehicle.isZcuBlocked) return 'ZCUBLOCKED'

	const isAnyLocationExist = !!(
		vehicle.locationPickup ||
		vehicle.locationDropoff ||
		vehicle.locationMove
	)
	const destPointId = Number.isInteger(Number(vehicle.destPoint))
		? Number(vehicle.destPoint)
		: undefined

	if (isAnyLocationExist) return 'RUNNING'
	if (
		isAnyLocationExist === false &&
		destPointId &&
		vehicle.curPoint !== destPointId
	)
		return 'HOMEIVR'
	if (
		isAnyLocationExist === false &&
		destPointId &&
		vehicle.curPoint === destPointId
	)
		return 'IDLE'

	return undefined
}

function getVehicleColorFromComplicatedMode(
	trackMonitorSetting: TrackMonitorSettingService['trackSetting'],
	vehicleMode?: string,
) {
	switch (vehicleMode) {
		case 'DISCONNECT':
			return trackMonitorSetting.disconnectModeVehicleColor
		case 'ERROR':
			return trackMonitorSetting.errorModeVehicleColor
		case 'MAINTENANCE':
			return trackMonitorSetting.maintenanceModeVehicleColor
		case 'MANUAL':
			return trackMonitorSetting.manualModeVehicleColor
		case 'SENSORSTOPPED':
			return trackMonitorSetting.sensorStoppedVehicleColor
		case 'ZCUBLOCKED':
			return trackMonitorSetting.zcuBlockedVehicleColor
		case 'RUNNING':
			return trackMonitorSetting.runningModeVehicleColor
		case 'HOMEIVR':
			return trackMonitorSetting.homeIvrModeVehicleColor
		case 'IDLE':
			return trackMonitorSetting.idleModeVehicleColor

		default:
			return 'deeppink'
	}
}

/**
 * check frontend/packages/oms-track-monitor/src/TrackObjects/vehicle/components/ChjsVehicle.ce.vue
 */
function getIsVehicleTransferDisabled(orderOrigin?: string | string[]) {
	const originInUpper = (
		typeof orderOrigin === 'string' ? orderOrigin : (orderOrigin ?? []).join('')
	).toUpperCase()

	const hasMCS = originInUpper.includes('MCS')
	const hasAsterisk = originInUpper.includes('*')

	return hasMCS === false && hasAsterisk === false
}
