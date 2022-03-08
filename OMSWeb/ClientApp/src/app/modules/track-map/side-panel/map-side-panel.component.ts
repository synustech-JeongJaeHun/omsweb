import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { MapStatesService } from '../map-states.service';
import { MessagesService } from '../../../services/messages.service';
import { PermissionEnums } from '../../../models/enums';
import { TrackStatusService } from '@oms/root/services/track-status.service';

@Component({
  selector: 'oms-map-side-panel',
  templateUrl: './map-side-panel.component.html',
  styleUrls: ['./map-side-panel.component.scss'],
})
export class MapSidePanelComponent implements OnChanges, OnDestroy {
  @Input('selectedObject') data: any;
  @Output() focus = new EventEmitter<any>()

  hasOverlap = true;
  private selfUpdateIntervalId
  private overlapObjectsUpdateIntervalId
  overlapList = [];

  readonly permissionEnums: typeof PermissionEnums = PermissionEnums;

  // segment
  segmentDisabledInfo = {
    disabled: false,
    authors: [],
    reasons: [],
  };

  get segmentDisableAuthors(): string {
    return this.segmentDisabledInfo.authors.join(', ');
  }
  get segmentDisabledReasons(): string {
    return this.segmentDisabledInfo.reasons.join('\n');
  }

  constructor(
    private statesSvc: MapStatesService,
    private messageSvc: MessagesService,
    private trackStatusService: TrackStatusService,
    private auth: AuthService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selfUpdateIntervalId)
      clearInterval(this.selfUpdateIntervalId)
    if (this.overlapObjectsUpdateIntervalId)
      clearInterval(this.overlapObjectsUpdateIntervalId)

    if (changes?.data?.currentValue) {
      this.bindObject();
    }
  }
  ngOnDestroy(): void {
    if (this.selfUpdateIntervalId)
      clearInterval(this.selfUpdateIntervalId)
    if (this.overlapObjectsUpdateIntervalId)
      clearInterval(this.overlapObjectsUpdateIntervalId)
  }

  hasPermission(permission: number): boolean {
    return AccountUtil.hasPermission(permission, this.auth.currentUser);
  }

  private bindObject() {
    const type = this.data.objectType.toUpperCase()
    switch (type) {
      case 'SEGMENT':
      case 'ZCU':
        this.hasOverlap = false;
        break;

      case 'POINT':
      case 'STATION':
      case 'BUFFER':
      case 'VEHICLE':
        this.startIntervalUpdateDataSelf(type, this.data.id)
        this.startIntervalUpdateOverlapObjects(type, this.data.id)
        this.hasOverlap = true;
        break;

      default:
        break;
    }
  }

  private startIntervalUpdateDataSelf(type, id) {

    const action = () => {
      switch (type) {
        case 'SEGMENT':
          {
            const current = this.trackStatusService.trackData.segments.find(s => s.id === id)
            this.data = { ...current, objectType: "SEGMENT" }
          }
          break
        case 'ZCU':
          {
            const current = this.trackStatusService.trackData.zcus.find(z => z.id === id)
            this.data = { ...current, objectType: "ZCU" }
          }
          break

        case 'POINT':
          {
            const current = this.trackStatusService.trackData.points.find(p => p.id === id)
            this.data = { ...current, objectType: "POINT" }
          }
          break;
        case 'STATION':
          {
            const current = this.trackStatusService.trackData.stations.find(s => s.id === id)
            this.data = { ...current, objectType: "STATION" }
          }
          break;
        case 'BUFFER':
          {
            const current = this.trackStatusService.trackData.buffers.find(b => b.id === id)
            this.data = { ...current, objectType: "BUFFER" }
          }
          break;
        case 'VEHICLE':
          {
            const current = this.trackStatusService.trackData.vehicles.find(v => v.id === id)
            this.data = { ...current, objectType: "VEHICLE" }
          }
          break;

        default:
          break;
      }
    }
    action()
    this.selfUpdateIntervalId = setInterval(action, 800)
  }

  private startIntervalUpdateOverlapObjects(type, id) {
    const getPointId = () => {
      switch (type) {
        case 'POINT':
          return this.data.id
        case 'STATION':
          return this.data.pointId
        case 'BUFFER':
          return this.data.pointId
        case 'VEHICLE':
          return this.trackStatusService.trackData.vehicles.find(v => v.id === id)?.curPoint
      }
    }

    this.overlapList = this.trackStatusService.getOverlapObjectOnPoint(getPointId())
    this.overlapObjectsUpdateIntervalId = setInterval(() => {
      this.overlapList = this.trackStatusService.getOverlapObjectOnPoint(getPointId())
    }, 800)
  }

  changeSegmentDisabled() {
    // disabled 상태값 변경
    this.segmentDisabledInfo.disabled = !this.segmentDisabledInfo.disabled;

    this.bindObject();

    if (this.segmentDisabledInfo.disabled) {
      this.messageSvc
        .sendDisableSegmentCommand({ action: 'disable-segment' }, this.data.id)
        .subscribe();
    } else {
      this.messageSvc
        .sendDisableSegmentCommand({ action: 'enable-segment' }, this.data.id)
        .subscribe();
    }
  }

  closePanel() {
    this.statesSvc.changeToolbarState('itemDetails', false);
  }

  // private bindSegment() {
  //   this.hasOverlap = false;
  //   this.segmentDisabledInfo.authors = new Array(0);
  //   this.segmentDisabledInfo.reasons = new Array(0);

  //   const { disableState } = this.data;
  //   if (disableState) {
  //     this.segmentDisabledInfo.disabled = true;
  //     const { vehicle = [], segment = [], user = [] } = disableState;
  //     vehicle.forEach((v) => {
  //       this.segmentDisabledInfo.authors.push(v.source_id);
  //       v.reason && this.segmentDisabledInfo.reasons.push(`- ${v.reason}`);
  //     });
  //     segment.forEach((s) => {
  //       this.segmentDisabledInfo.authors.push(s.source_id);
  //       s.reason && this.segmentDisabledInfo.reasons.push(`- ${s.reason}`);
  //     });
  //     user.forEach((u) => {
  //       this.segmentDisabledInfo.authors.push(u.source_id);
  //       u.reason && this.segmentDisabledInfo.reasons.push(`- ${u.reason}`);
  //     });
  //   }
  // }
}
