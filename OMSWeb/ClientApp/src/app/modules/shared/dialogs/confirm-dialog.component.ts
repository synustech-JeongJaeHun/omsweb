import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IConfirmMessage } from '../../../models/base.model';

@Component({
  selector: 'oms-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styles: [],
})
export class ConfirmDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public message: IConfirmMessage<unknown>,
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) { }

  ngOnInit(): void { }

  onConfirm() {
    this.dialogRef.close(true);
  }
}
