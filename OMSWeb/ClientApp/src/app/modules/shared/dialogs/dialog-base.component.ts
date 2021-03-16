import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'oms-dialog-base',
  templateUrl: './dialog-base.component.html',
  styleUrls: ['./dialog-base.component.scss'],
})
export class DialogBaseComponent implements OnInit {
  @Input() title: string;

  constructor(private dialogRef: MatDialogRef<DialogBaseComponent>) {}

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }
}
