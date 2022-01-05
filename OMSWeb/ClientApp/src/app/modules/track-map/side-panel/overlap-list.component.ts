import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import d3 = require('d3');
import { main_css } from '../../shared/utils/css-loader';
import { SvgDrawingUtil } from '../../shared/utils/svg-drawing.util';
import { MapDataService } from '../map-data.service';
import { MapStatesService } from '../map-states.service';

@Component({
  selector: 'oms-overlap-list',
  templateUrl: './overlap-list.component.html',
  styles: [
    `
      #overlapList {
        display: flex;
        flex-direction: column;
      }

      #overlapList ::ng-deep.overlap-item {
        height: 40px;
        cursor: pointer;
        padding: 8px 8px;
      }
      #overlapList ::ng-deep.overlap-item.current {
        font-weight: bold;
        background-color: var(--button-active-color);
        border-radius: 5px;
      }
    `,
  ],
})
export class OverlapListComponent implements OnInit, OnChanges {
  @Input('selectedObject') data: any;

  overlapList: any[] = [];
  // svgHeight: number;
  // padding: number;
  listContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

  get basePointId(): number {
    switch (this.data.objectType) {
      case 'Point':
        return this.data.id;
      case 'Zcu':
        return this.data.id;
      case 'Station':
      case 'Buffer':
      case 'Mtl':
        return this.data.pointId;
      case 'Vehicle':
        const { curPoint } = this.data;
        return curPoint?.point;
      default:
        break;
    }
  }

  constructor(
    private dataSvc: MapDataService,
    private stateSvc: MapStatesService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    const { data } = changes;
    if (data.currentValue) {
      this.bindOverlapData();
    }
  }

  ngOnInit(): void {
    this.bindOverlapData();
  }

  private bindOverlapData() {
    this.listContainer = d3.select('#overlapList');

    // clear list
    this.listContainer.selectAll('svg').remove();

    // basePointId
    const pointId = this.basePointId;

    // populate overlap
    const overlaps = [
      ...this.dataSvc.populateOverlapData(pointId, 'OVERLAP_MODULE'),
      ...this.dataSvc.populateOverlapDataForVehicles(pointId, 'OVERLAP_MODULE'),
    ];

    // put_selected_on_top
    for (let i = overlaps.length - 1; i > -1; i--) {
      let obj = overlaps[i];
      if (
        obj.id === this.data.id &&
        obj.constructor === this.data.constructor
      ) {
        obj = overlaps.splice(i, 1)[0];
        overlaps.unshift(obj);
        break;
      }
    }

    // init_overlap_module_panel
    if (overlaps.length > 0) {
      const length = main_css.station.width * 2;
      const unitClassName = 'overlap-unit';
      const padding = length / 3;
      const {
        map: { mapRotation, vehicleScale },
      } = this.stateSvc.preferences;

      overlaps.forEach((x) => {
        // update_overlap_module_panel('ADD', x.objectType, x, 'OVERLAP_MODULE')
        const className = x.objectType.toLowerCase();
        const currentClass =
          x.objectType === this.data.objectType && x.id === this.data.id
            ? 'current'
            : '';
        const svg = this.listContainer
          .append('svg')
          .attr('class', `overlap-item ${className} ${currentClass}`);
        const { objectType } = x;
        if (objectType === 'Vehicle') {
          // update_vehicle_dom(x, main_css.vehicle, 3, 'OVERLAP_MODULE',false)
          SvgDrawingUtil.buildVehicleUnit(
            x,
            svg,
            unitClassName,
            main_css.vehicle,
            3,
            'OVERLAP_MODULE',
            false,
            { mapRotation }
          );
        } else {
          // update_dom(objectType, x, main_css[objectType.toLowerCase()], 3, 'OVERLAP_MODULE',false)
          SvgDrawingUtil.buildUnit(
            objectType.toUpperCase(),
            x,
            svg,
            unitClassName,
            main_css[objectType.toLowerCase()],
            3,
            'OVERLAP_MODULE',
            false,
            { mapRotation }
          );
        }

        svg
          .select(`.${unitClassName}`)
          .attr('transform', `translate(${padding}, ${padding})`);

        svg.on('click', () => {
          this.stateSvc.actionState$.emit({
            type: 'selectUnit',
            targetId: x.id,
            targetType: x.objectType.toUpperCase(),
          })
        });
      });
    }
  }
}
