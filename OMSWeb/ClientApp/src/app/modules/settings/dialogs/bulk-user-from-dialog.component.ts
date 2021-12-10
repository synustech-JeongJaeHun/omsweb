import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IProfileForm, ISessionUser } from '../../../models/user.model';
import { Papa } from 'ngx-papaparse';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'oms-bulk-user-form-dialog',
  templateUrl: './bulk-user-from-dialog.component.html',
  styleUrls: ['./bulk-user-from-dialog.component.scss'],
})
export class BulkUserFormDialogComponent {
  public csvTableData: [string, string, string, string, string, string][] = [];
  public csvValidationMessages: string = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) private user: ISessionUser,
    private dialog: MatDialogRef<BulkUserFormDialogComponent>,
    private t$: TranslateService,
    private papa: Papa
  ) { }

  onSubmit(form: IProfileForm) {
    this.dialog.close(form);
  }

  onCancel() {
    this.dialog.close();
  }

  importToGrid() {
    this.dialog.close(this.csvTableData);
  }

  fileChangeListner(files?: File[]): void {
    if (files === null || files === undefined || files.length < 1)
      throw Error(this.t$.instant('names.noFileSelected'));

    const reader: FileReader = new FileReader();
    reader.onload = e => {
      const csv = reader.result as string;
      const results = this.papa.parse(csv, { header: false });

      if (((results?.data?.length ?? 0) < 1) || (results?.errors?.length > 0))
        throw Error(this.t$.instant('names.errorParsingCSVFile'));

      const rows = (results.data as any[]).slice(1, results.data.length);
      console.log(rows)
      const validRows = rows.filter(this.validateCsvRow)

      this.csvValidationMessages
        = `${this.t$.instant('names.csvTotalMessage')} [${rows.length}] ${this.t$.instant('names.csvSuccessMessage')} [${validRows.length}] ${this.t$.instant('names.csvFailedMessage')} [${rows.length - validRows.length}]`
      this.csvTableData = validRows;
    };
    reader.readAsText(files[0]);
  }

  validateCsvRow(row: any) {
    return (
      row[0].length > 0 && row[0].length <= 64 // Check user_id legnth
      && row[1].length > 0 && row[1].length <= 32 // Check first_name legnth
      && row[2].length > 0 && row[2].length <= 32 // Check last_name legnth
      && row[3].length >= 5 && row[3].length <= 64 // Check email legnth
      && row[4].length >= 4 && row[4].length <= 64 // Check password legnth
      && row[5].length > 0 && row[5].length <= 64 // Check roles legnth
    )
  }
}
