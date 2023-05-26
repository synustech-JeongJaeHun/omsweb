import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {MobileService} from "@oms/services/mobile.service";

@Component({
  selector: 'oms-dialog-base',
  templateUrl: './dialog-base.component.html',
  styleUrls: ['./dialog-base.component.scss'],
})
export class DialogBaseComponent implements OnInit {
  @Input() title: string;

  constructor(private dialogRef: MatDialogRef<DialogBaseComponent>, private mobileSvc: MobileService) { }

  ngOnInit(): void { }

  close() {
    this.dialogRef.close(false);
  }

  get isMobile() {
    return this.mobileSvc.isMobile
  }
}
