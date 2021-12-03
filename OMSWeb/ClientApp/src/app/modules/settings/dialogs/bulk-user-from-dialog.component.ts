import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IProfileForm, ISessionUser } from '../../../models/user.model';
import { Papa } from 'ngx-papaparse';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'oms-bulk-user-form-dialog',
  templateUrl: './bulk-user-from-dialog.component.html',
  styleUrls: ['./bulk-user-from-dialog.component.scss'],
})
export class BulkUserFormDialogComponent implements OnInit {
  public selectedCSVFileName: string;
  private isCSV_Valid: boolean;
  public csvTableData: any;
  public csvValidationMessages: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private user: ISessionUser,
    private dialog: MatDialogRef<BulkUserFormDialogComponent>,
    private t$: TranslateService,
    private papa: Papa
  ) {
    this.csvValidationMessages = "";
  }

  ngOnInit(): void { }

  onSubmit(form: IProfileForm) {
    this.dialog.close(form);
  }

  onCancel() {
    this.dialog.close();
  }

  fileChangeListner($event: any): void {

    const files = $event.srcElement.files;

    if (files !== null && files !== undefined && files.length > 0) {
      this.selectedCSVFileName = files[0].name;

      const reader: FileReader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = e => {

        const csv = reader.result;
        const results = this.papa.parse(csv as string, { header: false });

        // VALIDATE PARSED CSV FILE
        if (results !== null && results !== undefined && results.data !== null &&
          results.data !== undefined && results.data.length > 0 && results.errors.length === 0) {
          this.isCSV_Valid = true;

          let csvTableHeader = results.data[0];

          this.csvTableData = [...results.data.slice(1, results.data.length)];

          this.csvTableData = this.checkValidationCSVTableData(this.csvTableData);

        } else {
          for (let i = 0; i < results.errors.length; i++) {
            throw Error(this.t$.instant('names.errorParsingCSVFile'));
          }
        }
      };
    } else {
      throw Error(this.t$.instant('names.noFileSelected'));
    }
  }

  importToGrid(): void {
    this.dialog.close(this.csvTableData);
  }

  checkValidationCSVTableData(csvTable: any): any {
    var validCSVTableData = new Array();

    for (let idx = 0; idx < csvTable.length; idx++) {
      if (csvTable[idx][0].length > 0 && csvTable[idx][0].length <= 64 // Check user_id legnth
        && csvTable[idx][1].length > 0 && csvTable[idx][1].length <= 32 // Check first_name legnth
        && csvTable[idx][2].length > 0 && csvTable[idx][2].length <= 32 // Check last_name legnth
        && csvTable[idx][3].length >= 5 && csvTable[idx][3].length <= 64 // Check email legnth
        && csvTable[idx][4].length >= 4 && csvTable[idx][4].length <= 64 // Check password legnth
        && csvTable[idx][5].length > 0 && csvTable[idx][5].length <= 64 // Check roles legnth
      ) {
        validCSVTableData.push(csvTable[idx]);
      }
    }

    this.csvValidationMessages = this.t$.instant('names.csvTotalMessage') + " [" + (csvTable.length - 1) + "] " + this.t$.instant('names.csvSuccessMessage') + " [" + validCSVTableData.length + "] " + this.t$.instant('names.csvFailedMessage') + " [" + (csvTable.length - 1 - validCSVTableData.length) + "]";

    return validCSVTableData;
  }
}
