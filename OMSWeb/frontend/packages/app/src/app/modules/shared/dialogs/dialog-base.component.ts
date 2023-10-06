import {Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {MobileService} from "@oms/services/mobile.service";

@Component({
  selector: 'oms-dialog-base',
  templateUrl: './dialog-base.component.html',
  styleUrls: ['./dialog-base.component.scss'],
})
export class DialogBaseComponent implements OnInit {
  @Input() title: string;
  @Input() activeResize? = false;
  @Input() isMinimize? = false;
  isContentShow= true;
  @Output() setMinimize? = new EventEmitter<boolean>();

  constructor(private dialogRef: MatDialogRef<DialogBaseComponent>, private mobileSvc: MobileService) {
  }

  ngOnInit(): void {
    this.isMinimize && this.reSize(this.isMinimize)
  }

  close() {
    this.dialogRef.close(false);
  }

  reSize(isShow=false){
    this.isContentShow=!isShow
    this.dialogRef.updateSize('', this.isContentShow ?  'auto': '32px')
    this.dialogRef.updatePosition(this.isContentShow ?  {top:'0', left: '0'}: {top:'0', left: '0'})
    this.setMinimize.emit(!this.isContentShow)
  }

  get isMobile() {
    return this.mobileSvc.isMobile
  }
}
