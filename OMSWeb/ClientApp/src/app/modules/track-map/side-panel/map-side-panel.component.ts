import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { MapStatesService } from '../map-states.service';
import { MessagesService } from '../../../services/messages.service';
import { PermissionEnums } from '../../../models/enums';

@Component({
  selector: 'oms-map-side-panel',
  templateUrl: './map-side-panel.component.html',
  styleUrls: ['./map-side-panel.component.scss'],
})
export class MapSidePanelComponent implements OnInit, OnChanges {
  @Input('selectedObject') data: any;

  hasOverlap = true;

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
    private auth: AuthService
  ) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    const { data } = changes;
    if (data.currentValue) {
      this.bindObject();
    }
  }

  hasPermission(permission: number): boolean {
    return AccountUtil.hasPermission(permission, this.auth.currentUser);
  }

  private bindObject() {
    this.hasOverlap = true;
    switch (this.data.objectType) {
      case 'Vehicle':
        break;
      case 'Segment':
        this.bindSegment();
        break;
      case 'ZCU':
        this.hasOverlap = false;
        break;
      default:
        break;
    }
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

  private bindSegment() {
    this.hasOverlap = false;
    this.segmentDisabledInfo.authors = new Array(0);
    this.segmentDisabledInfo.reasons = new Array(0);

    const { disableState } = this.data;
    if (disableState) {
      this.segmentDisabledInfo.disabled = true;
      const { vehicle = [], segment = [], user = [] } = disableState;
      vehicle.forEach((v) => {
        this.segmentDisabledInfo.authors.push(v.source_id);
        v.reason && this.segmentDisabledInfo.reasons.push(`- ${v.reason}`);
      });
      segment.forEach((s) => {
        this.segmentDisabledInfo.authors.push(s.source_id);
        s.reason && this.segmentDisabledInfo.reasons.push(`- ${s.reason}`);
      });
      user.forEach((u) => {
        this.segmentDisabledInfo.authors.push(u.source_id);
        u.reason && this.segmentDisabledInfo.reasons.push(`- ${u.reason}`);
      });
    }
  }
}
