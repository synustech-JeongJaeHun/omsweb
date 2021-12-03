import { main_css } from '../../shared/utils/css-loader';

export namespace SvgDrawingUtil {
  export const buildVehicleUnit = (
    data: any,
    svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    className: string,
    dom_css: any,
    zoom_level: number,
    group_type: string,
    is_zoom_only: boolean,
    options: any = {}
  ) => {
    const mainUnit = svg
      .append('g')
      .attr('class', `vehicle-unit ${className}`)
      .attr('id', `id_${data.id}`)
      .attr('x', 0)
      .attr('y', 0)
      .attr('transform', `translate(0, 0)`);

    buildSubUnit(
      'VEHICLE',
      mainUnit,
      data,
      dom_css,
      zoom_level,
      group_type,
      null,
      options
    );
  };

  export const buildUnit = (
    object_type: string,
    data: any,
    svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    className: string,
    dom_css: any,
    zoom_level: number,
    group_type: string,
    is_zoom_only: boolean,
    options: any = {}
  ) => {
    let mainUnit: any;
    switch (object_type) {
      case 'POINT':
        mainUnit = svg
          .append('g')
          .attr('class', `point-unit ${className}`)
          .attr('id', `id_${data.id}`)
          .attr('x', data.invertedCoord.x)
          .attr('y', data.invertedCoord.y);

        if (zoom_level === 2) {
          buildSubUnit(
            'POINT',
            mainUnit,
            data,
            dom_css,
            zoom_level,
            group_type,
            null,
            options
          );
        } else if (zoom_level === 3) {
          buildSubUnit(
            'POINT',
            mainUnit,
            data,
            dom_css,
            zoom_level,
            group_type,
            null,
            options
          );
          buildSubUnit(
            'POINT_LABEL',
            mainUnit,
            data,
            dom_css,
            zoom_level,
            group_type,
            null,
            options
          );
        }
        break;
      case 'STATION':
        mainUnit = svg
          .append('g')
          .attr('class', `station-unit ${className}`)
          .attr('id', `id_${data.id}`)
          .attr('x', 0)
          .attr('y', 0)
          .attr('transform', `translate(0, 0)`);

        buildSubUnit(
          'STATION',
          mainUnit,
          data,
          dom_css,
          zoom_level,
          group_type,
          null,
          options
        );
        mainUnit
          .select('.station_path')
          .attr('d', dom_css.icon_level3)
          .attr('level', 'level3');
        mainUnit
          .select('.station_mask')
          .attr('d', dom_css.icon_level3)
          .attr('level', 'level3');

        buildSubUnit(
          'STATION_DETAIL',
          mainUnit,
          data,
          dom_css,
          zoom_level,
          group_type,
          null,
          options
        );

        break;
      case 'BUFFER':
        mainUnit = svg
          .append('g')
          .attr('class', `buffer-unit ${className}`)
          .attr('id', `id_${data.id}`)
          .attr('x', 0)
          .attr('y', 0)
          .attr('transform', `translate(0, 0)`);

        buildSubUnit(
          'BUFFER',
          mainUnit,
          data,
          dom_css,
          zoom_level,
          group_type,
          null,
          options
        );
        mainUnit
          .select('.buffer_path')
          .attr('d', dom_css.icon_level3)
          .attr('level', 'level3');
        mainUnit
          .select('.buffer_mask')
          .attr('d', dom_css.icon_level3)
          .attr('level', 'level3');
        buildSubUnit(
          'BUFFER_DETAIL',
          mainUnit,
          data,
          dom_css,
          zoom_level,
          group_type,
          null,
          options
        );
        break;
      default:
        break;
    }
  };

  export const buildSubUnit = (
    object_type: string,
    dom_object_group: any,
    layout_object: any,
    dom_css: any,
    zoom_level: number = 3,
    group_type: string,
    group_colors: any,
    options: any = {}
  ) => {
    const overlap_adjustment = true;
    const offset_multiplier = zoom_level / 3;
    const { mapRotation = 0, vehicleScale = 1 } = options;

    switch (object_type) {
      case 'POINT':
        dom_object_group
          .append('circle')
          .attr('class', 'point_circle')
          .attr('fill', main_css.point.color)
          .attr('r', main_css.point.radius)
          .attr('cx', 0)
          .attr('cy', 0);

        if (overlap_adjustment) {
          dom_object_group
            .append('rect')
            .attr('class', 'point_mask')
            .attr('fill', 'transparent')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 20)
            .attr('height', 20);
        } else {
          dom_object_group
            .append('circle')
            .attr('class', 'point_mask')
            .attr('fill', 'transparent')
            .attr('r', main_css.general.mask_weight / 2)
            .attr('cx', 0)
            .attr('cy', 0);
        }
        break;
      case 'POINT_LABEL':
        dom_object_group
          .append('text')
          .attr('class', 'label')
          .attr('id', function () {
            let id = layout_object.logicalId
              ? layout_object.logicalId
              : layout_object.id;
            return `id_${id}`;
          })
          .attr('font-size', `${dom_css.label_font_size}px`)
          .attr('x', function () {
            if (overlap_adjustment) {
              return dom_css.label_offset * 2;
            } else {
              return dom_css.label_offset;
            }
          })
          .attr('y', function () {
            if (overlap_adjustment) {
              return dom_css.label_font_size / 2;
            } else {
              return dom_css.label_font_size / 2;
            }
          })
          .text(function () {
            let id = layout_object.logicalId
              ? layout_object.logicalId
              : layout_object.id;
            if (overlap_adjustment) {
              return `Point ${id}`;
            } else {
              return `${id}`;
            }
          });
        break;
      case 'VEHICLE':
        // Add group id group
        if (group_colors) {
          if (layout_object.group) {
            let group_svg = dom_object_group.select('.group_svg');
            let group_size = main_css.group.vehicle_group_size;
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
                    return `rotate(${-mapRotation})scale(${vehicleScale})`;
                  else return '';
                })
                .style('opacity', main_css.group.opacity)
                .lower();
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
            .attr('stroke', function () {
              let color;
              if (layout_object.mode == 'M') {
                color = dom_css.color_mode_manual_outline;
              } else if (layout_object.mode == 'S') {
                color = dom_css.color_mode_sloppy_manual_outline;
              } else if (layout_object.mode == 'A') {
                color = dom_css.color_mode_auto_outline;
              } else {
                color = dom_css.color_mode_none_outline;
              }

              return color;
            })
            .attr('stroke-width', dom_css.line_weight + 2)
            .attr('transform', () => {
              if (!overlap_adjustment) return `scale(${vehicleScale})`;
              else return '';
            });

          // Main Element SVG
          dom_object_group
            .append('circle')
            .attr('class', 'vehicle_circle')
            .attr('r', dom_css.radius)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', 'none')
            .attr('stroke', function () {
              let color;
              if (layout_object.mode == 'M') {
                color = dom_css.color_mode_manual;
              } else if (layout_object.mode == 'S') {
                color = dom_css.color_mode_sloppy_manual;
              } else if (layout_object.mode == 'A') {
                color = dom_css.color_mode_auto;
              } else {
                color = dom_css.color_mode_none;
              }

              return color;
            })
            .attr('stroke-width', dom_css.line_weight)
            .attr('transform', () => {
              if (!overlap_adjustment) return `scale(${vehicleScale})`;
              else return '';
            });

          // Add clean dashed line
        } else if (layout_object.type === 'CLEANING') {
          dom_object_group
            .append('rect')
            .attr('class', 'vehicle_circle_clean')
            .attr('width', dom_css.radius * 2)
            .attr('height', dom_css.radius * 2)
            .attr('x', -dom_css.radius)
            .attr('y', -dom_css.radius)
            .attr('fill', function () {
              return dom_css.color_mode_auto;
            })
            .attr('stroke', function () {
              return dom_css.color_mode_auto_outline;
            })
            .attr('stroke-width', dom_css.clean_line_weight + 2)
            .attr('transform', () => {
              if (!overlap_adjustment)
                return `rotate(${-mapRotation + 45})scale(${vehicleScale})`;
              else return 'rotate(45)';
            });
        }

        if (layout_object.isStale) {
          dom_object_group
            .append('g')
            .attr('class', 'stale')
            .attr('transform', () => {
              if (!overlap_adjustment)
                return `rotate(${-mapRotation})translate(${dom_css.radius * 2 * vehicleScale
                  },-${dom_css.radius * vehicleScale})scale(${vehicleScale})`;
              else return `translate(${dom_css.radius * 2},-${dom_css.radius})`;
            });
          let stale_element = dom_object_group.select('g.stale');
          stale_element
            .append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 5.5)
            .attr('fill', 'white');
          stale_element
            .append('path')
            .attr('d', dom_css.stale_path)
            .attr('fill', 'black')
            .attr('transform', 'translate(-6.5,-6.5)scale(0.013)');
        }

        // Unload/load fail
        if (layout_object.cargoTransferResult) {
          dom_object_group
            .append('g')
            .attr('class', 'fail')
            .attr('transform', () => {
              if (!overlap_adjustment) return `scale(${vehicleScale})`;
              else return '';
            })
            .append('path')
            .attr('d', dom_css.fail_path)
            .attr('transform', 'translate(-3.8,-3.8)scale(0.015)');
        }

        // Prevent push
        if (!layout_object.push) {
          let push_svg = dom_object_group
            .append('g')
            .attr('class', 'push')
            .attr('transform', () => {
              if (!overlap_adjustment)
                return `rotate(${-mapRotation})translate(${((dom_css.radius * 4) / 3) * vehicleScale
                  },${dom_css.radius * vehicleScale})scale(${vehicleScale})`;
              else
                return `translate(${(dom_css.radius * 4) / 3},${dom_css.radius
                  })`;
            });
          push_svg
            .append('path')
            .attr('d', dom_css.prevent_push_path)
            .attr('fill', dom_css.prevent_inner_color)
            .attr('transform', 'translate(2,-3.5)scale(0.015)');
          push_svg
            .append('path')
            .attr('d', dom_css.prevent_path)
            .attr('fill', dom_css.prevent_outer_color)
            .attr('transform', 'rotate(90)translate(-6.5,-12.5)scale(0.015)');
        }

        // Prevent call
        if (layout_object.call.length === 0) {
          let push_svg = dom_object_group.select('.push');
          let x_offset = (dom_css.radius * 4) / 3;
          if (push_svg.nodes().length > 0) {
            x_offset = dom_css.radius * 3;
          }
          let call_svg = dom_object_group
            .append('g')
            .attr('class', 'call')
            .attr('transform', () => {
              if (!overlap_adjustment)
                return `rotate(${-mapRotation})translate(${x_offset * vehicleScale
                  },${dom_css.radius * vehicleScale})scale(${vehicleScale})`;
              else return `translate(${x_offset},${dom_css.radius})`;
            });
          call_svg
            .append('path')
            .attr('d', dom_css.prevent_call_path)
            .attr('fill', dom_css.prevent_inner_color)
            .attr('transform', 'rotate(-90)translate(-4.5,1.5)scale(0.015)');
          call_svg
            .append('path')
            .attr('d', dom_css.prevent_path)
            .attr('fill', dom_css.prevent_outer_color)
            .attr('transform', 'rotate(90)translate(-6.5,-12.5)scale(0.015)');
        }

        dom_object_group
          .append('text')
          .attr('class', 'label')
          .attr('id', function () {
            return `id_${layout_object.id}`;
          })
          .attr('font-size', `${dom_css.font_size}px`)
          .attr('display', () => {
            if (vehicleScale >= 0.6) {
              return 'block';
            }
            return 'none';
          })
          .attr('x', () => {
            let x = (-dom_css.text_offset * 3) / 4;
            if (overlap_adjustment) {
              return dom_css.text_offset * 2;
            } else {
              if (vehicleScale >= 0.6) {
                x *= vehicleScale;
              }
            }

            return x;
          })
          .attr('y', () => {
            let y = -dom_css.radius / 2;
            if (overlap_adjustment) {
              return -dom_css.radius / 3;
            } else {
              if (vehicleScale >= 0.6) {
                y *= vehicleScale;
              }
            }

            return y;
          })
          .html(function () {
            let id = layout_object.logicalId
              ? layout_object.logicalId
              : layout_object.id;
            if (overlap_adjustment) {
              return `Vehicle ${id}`;
            } else {
              return id;
            }
          })
          .attr('text-anchor', function () {
            if (overlap_adjustment) {
              return 'start';
            } else {
              return 'end';
            }
          })
          .attr('transform', () => {
            if (!overlap_adjustment) return `rotate(${-mapRotation})`;
            else return '';
          });

        if (layout_object.hotlot) {
          dom_object_group
            .append('rect')
            .attr('class', 'hotlot')
            .attr('display', () => {
              if (vehicleScale >= 0.6 || overlap_adjustment) {
                return 'block';
              } else {
                return 'none';
              }
            })
            .attr('fill', function () {
              return dom_css.color_hotlot;
            })
            .attr('x', () => {
              return (
                -((dom_css.text_offset * 3) / 4) *
                (overlap_adjustment ? vehicleScale : 1) -
                layout_object.orderId.toString().length * 6
              );
              // return -(layout_object.orderId.toString().length * 6 + parseInt(dom_css.text_offset) - 5)
            })
            .attr('y', () => {
              return (
                (dom_css.radius * 2 - dom_css.radius / 2) *
                (overlap_adjustment ? vehicleScale : 1) -
                10
              );
            })
            .attr('width', () => {
              return `${layout_object.orderId.toString().length * 6}px`;
            })
            .attr('height', 13)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('transform', () => {
              if (!overlap_adjustment) return `rotate(${-mapRotation})`;
              else return '';
            })
            .lower();
        }

        dom_object_group
          .append('text')
          .attr('class', 'label_order')
          .attr('display', () => {
            if (vehicleScale >= 0.6 || overlap_adjustment) {
              return 'block';
            } else {
              return 'none';
            }
          })
          .attr('font-size', `${dom_css.font_size}px`)
          .attr(
            'fill',
            layout_object.hotlot
              ? dom_css.label_hotlot_color
              : dom_css.label_color
          )
          .attr('x', () => {
            let x = (-dom_css.text_offset * 3) / 4;
            if (overlap_adjustment) {
              x = dom_css.text_offset * 2;
            } else {
              if (vehicleScale >= 0.6) {
                x *= vehicleScale;
              }
            }
            return x;
          })
          .attr('y', () => {
            let y = dom_css.radius * 2 - dom_css.radius / 2;
            if (overlap_adjustment) {
              y = dom_css.radius * 2 - dom_css.radius / 2;
            } else {
              if (vehicleScale >= 0.6) {
                y *= vehicleScale;
              }
            }
            return y;
          })
          .html(function () {
            if (overlap_adjustment) {
              if (layout_object.orderId) {
                return `Order: ${layout_object.orderId}`;
              } else {
                return 'Order: None';
              }
            } else {
              if (layout_object.orderId) {
                return `${layout_object.orderId}`;
              } else {
                return '';
              }
            }
          })
          .attr('text-anchor', function () {
            if (overlap_adjustment) {
              return 'start';
            } else {
              return 'end';
            }
          })
          .attr('transform', () => {
            if (!overlap_adjustment) return `rotate(${-mapRotation})`;
            else return '';
          });

        if (
          layout_object.cargoState === 'F' ||
          layout_object.cargoState === 'U' ||
          layout_object.cargoState === 'L'
        ) {
          dom_object_group
            .append('circle')
            .attr('class', function () {
              if (layout_object.cargoState === 'F') {
                return 'foup loaded';
              } else if (layout_object.cargoState === 'L') {
                return 'foup loading';
              } else {
                return 'foup unloading';
              }
            })
            .attr('transform', () => {
              if (!overlap_adjustment) return `scale(${vehicleScale})`;
              else return '';
            })
            .lower();
        } else {
          dom_object_group.select('.foup').remove();
        }

        if (layout_object.isSensorStopped === true) {
          dom_object_group
            .append('circle')
            .attr('class', 'corner')
            .attr('r', dom_css.sensor_stop_radius)
            .attr('cx', -(2 + dom_css.sensor_stop + dom_css.sensor_stop_radius / 2))
            .attr('cy', -(2 + dom_css.sensor_stop + dom_css.sensor_stop_radius / 2))
            .attr('fill', dom_css.color_sensor_stop)
            .attr('stroke', dom_css.stroke_color_sensor_stop)
            .attr('stroke-width', dom_css.stroke_width_sensor_stop)
            .attr('transform', () => {
              if (!overlap_adjustment)
                return `rotate(${-mapRotation})scale(${vehicleScale})`;
              else return '';
            });
        } else {
          dom_object_group.select('.corner').remove();
        }

        if (layout_object.isBlocked === true) {
          dom_object_group
            .append('circle')
            .attr('class', 'corner')
            .attr('r', dom_css.blocked_radius)
            .attr('cx', -(2 + dom_css.radius + dom_css.blocked_radius / 2))
            .attr('cy', -(2 + dom_css.radius + dom_css.blocked_radius / 2))
            .attr('fill', dom_css.color_blocked)
            .attr('transform', () => {
              if (!overlap_adjustment)
                return `rotate(${-mapRotation})scale(${vehicleScale})`;
              else return '';
            });
        } else {
          dom_object_group.select('.corner').remove();
        }

        if (layout_object.errorList != 0) {
          dom_object_group
            .append('path')
            .attr('class', 'error')
            .attr('d', dom_css.icon_error)
            .attr('fill', function () {
              return dom_css.color_mode_error;
            })
            .attr('stroke', function () {
              return dom_css.color_mode_error_outline;
            })
            .attr('stroke-width', `${dom_css.line_weight / 3}px`)
            .attr('transform', () => {
              if (!overlap_adjustment)
                return `rotate(${-mapRotation})scale(${vehicleScale})`;
              else return '';
            });
        } else {
          dom_object_group.select('.error').remove();
        }

        if (overlap_adjustment) {
          dom_object_group
            .append('rect')
            .attr('class', 'vehicle_mask')
            .attr('fill', 'transparent')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 20)
            .attr('height', 20);
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
            .attr('transform', `scale(${vehicleScale})`);
        }
        break;
      case 'STATION':
        dom_object_group
          .append('path')
          .attr('class', 'station_path')
          .attr('level', `level${zoom_level}`)
          .attr('d', main_css.station[`icon_level${zoom_level}`]);

        dom_object_group
          .append('rect')
          .attr('class', 'station_mask')
          .attr('fill', 'transparent')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 20)
          .attr('height', 20);
        break;
      case 'STATION_DETAIL':
        let label_svg = dom_object_group
          .append('text')
          .attr('class', 'label')
          .attr('font-size', `${dom_css.font_size}px`)
          .attr('x', function () {
            if (overlap_adjustment) {
              return dom_css.text_offset * 2;
            } else {
              return dom_css.text_offset;
            }
          })
          .attr('y', function () {
            if (overlap_adjustment) {
              return dom_css.font_size / 2;
            } else {
              return dom_css.width / 2;
            }
          })
          .text(function () {
            let id = layout_object.logicalId
              ? layout_object.logicalId
              : layout_object.id;
            if (overlap_adjustment) {
              return `Station ${id}`;
            } else {
              return id;
            }
          })
          .attr('text-anchor', 'start');
        break;
      case 'BUFFER':
        if (zoom_level === 1) {
          dom_object_group
            .append('circle')
            .attr('class', 'buffer_path')
            .attr('level', `level${zoom_level}`)
            .attr('transform', `rotate(${-mapRotation})`);

          dom_object_group
            .append('circle')
            .attr('class', 'buffer_mask')
            .attr('level', `level${zoom_level}`)
            .attr('transform', `rotate(${-mapRotation})`);
        } else {
          if (overlap_adjustment) {
            // only when going into overlap or floating module at level 3
            dom_object_group
              .append('path')
              .attr('class', 'buffer_path')
              .attr('level', `level${zoom_level}`)
              .attr('d', main_css.buffer[`icon_level${zoom_level}`]);

            dom_object_group
              .append('rect')
              .attr('class', 'buffer_mask')
              .attr('fill', 'transparent')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', 20)
              .attr('height', 20);
          } else {
            dom_object_group
              .append('path')
              .attr('class', 'buffer_path')
              .attr('level', `level${zoom_level}`)
              .attr('d', main_css.buffer[`icon_level${zoom_level}`])
              .attr(
                'transform',
                `translate(${layout_object.directionOffset.x * offset_multiplier
                }, ${layout_object.directionOffset.y * offset_multiplier
                })rotate(${-mapRotation})`
              );
            dom_object_group
              .append('path')
              .attr('class', 'buffer_mask')
              .attr('level', `level${zoom_level}`)
              .attr('d', main_css.buffer[`icon_level${zoom_level}`])
              .attr(
                'transform',
                `translate(${layout_object.directionOffset.x * offset_multiplier
                }, ${layout_object.directionOffset.y * offset_multiplier
                })rotate(${-mapRotation})`
              );
          }
        }
        break;
      case 'BUFFER_DETAIL':
        dom_object_group
          .append('text')
          .attr('class', 'label')
          .attr('font-size', `${dom_css.font_size}px`)
          .attr('x', function () {
            if (overlap_adjustment) {
              return dom_css.text_offset * 2;
            } else {
              return dom_css.text_offset;
            }
          })
          .attr('y', function () {
            if (overlap_adjustment) {
              return 0;
            } else {
              return dom_css.width / 2;
            }
          })
          .text(function () {
            let id = layout_object.logicalId
              ? layout_object.logicalId
              : layout_object.id;
            if (overlap_adjustment) {
              return `Buffer ${id}`;
            } else {
              return id;
            }
          })
          .attr('text-anchor', 'start');

        break;
      case 'MTL':
        dom_object_group
          .append('path')
          .attr('d', main_css.mtl[`icon_level${zoom_level}`])
          .attr('class', 'mtl_path')
          .attr('level', `level${zoom_level}`);

        if (overlap_adjustment) {
          dom_object_group
            .append('rect')
            .attr('class', 'mtl_mask')
            .attr('fill', 'transparent')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 20)
            .attr('height', 20);
        } else {
          dom_object_group
            .append('path')
            .attr('class', 'mtl_mask')
            .attr('d', main_css.mtl[`icon_level${zoom_level}`])
            .attr('level', `level${zoom_level}`)
            .attr('stroke', 'transparent')
            .attr('stroke-width', main_css.general.mask_weight / 2)
            .attr('fill', 'none');
        }
        break;
      case 'MTL_DETAIL':
        dom_object_group
          .append('text')
          .attr('class', 'label')
          .attr('font-size', `${dom_css.font_size}px`)
          .attr('x', function () {
            if (overlap_adjustment) {
              return dom_css.text_offset * 2;
            } else {
              return dom_css.text_offset;
            }
          })
          .attr('y', function () {
            if (overlap_adjustment) {
              return 0;
            } else {
              return dom_css.width / 2;
            }
          })
          .attr('text-anchor', 'start')
          .text(function () {
            let id = layout_object.logicalId
              ? layout_object.logicalId
              : layout_object.id;
            if (overlap_adjustment) {
              return `MTL ${id}`;
            } else {
              return id;
            }
          });
        break;
      default:
        break;
    }
  };
}
