import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import d3 = require('d3');
import { main_css } from "../../shared/utils/css-loader";
import { SvgDrawingUtil } from "../../shared/utils/svg-drawing.util";

@Component({
  selector: 'oms-map-overlapped',
  templateUrl: './map-overlapped.component.html',
  styleUrls: ['map-overlapped.component.scss'],
})
export class MapOverlappedComponent {
  @Input('selectedObject') data: any;
  @Input() overlapList: any[] = [];
  @Output() leftClick = new EventEmitter<any>();
  @Output() rightClick = new EventEmitter<{ object: any, event: Event }>();

  listContainer: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

  ngOnChanges(changes: SimpleChanges): void {
    const { data } = changes;
    if (data?.currentValue) {
      this.bindOverlapData();
    }
  }


  ngOnInit(): void {
    this.bindOverlapData();
  }

  private bindOverlapData() {
    this.listContainer = d3.select('#map-overlapped');

    // clear list
    this.listContainer.selectAll('svg').remove();

    const overlaps = this.overlapList

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
      // const {
      //   map: { mapRotation, vehicleScale },
      // } = this.stateSvc.preferences;

      overlaps.forEach((overlap) => {
        // update_overlap_module_panel('ADD', x.objectType, x, 'OVERLAP_MODULE')
        const className = overlap.objectType.toLowerCase();
        const currentClass =
          overlap.objectType?.toUpperCase() === this.data.objectType?.toUpperCase() && overlap.id === this.data.id
            ? 'current'
            : '';
        const svg = this.listContainer
          .append('svg')
          .attr('class', `overlap-item ${className} ${currentClass}`);
        const { objectType } = overlap;
        if (objectType.toLowerCase() === 'vehicle') {
          // update_vehicle_dom(x, main_css.vehicle, 3, 'OVERLAP_MODULE',false)
          SvgDrawingUtil.buildVehicleUnit(
            overlap,
            svg,
            unitClassName,
            main_css.vehicle,
            3,
            'OVERLAP_MODULE',
            false,
            { mapRotation: 0 }
          );
        } else {
          // update_dom(objectType, x, main_css[objectType.toLowerCase()], 3, 'OVERLAP_MODULE',false)
          SvgDrawingUtil.buildUnit(
            objectType.toUpperCase(),
            overlap,
            svg,
            unitClassName,
            main_css[objectType.toLowerCase()],
            3,
            'OVERLAP_MODULE',
            false,
            { mapRotation: 0 }
          );
        }

        svg
          .select(`.${unitClassName}`)
          .attr('transform', `translate(${padding}, ${padding})`);

        svg.on('click', () => {
          this.leftClick.emit(overlap)
        });
        svg.on('contextmenu', () => {
          if (d3?.event?.preventDefault) d3.event.preventDefault()
          this.rightClick.emit({
            object: overlap,
            event: d3.event
          })
        });
      });
    }
  }
}
