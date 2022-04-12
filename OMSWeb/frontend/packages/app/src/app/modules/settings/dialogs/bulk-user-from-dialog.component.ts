import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IProfileForm } from '../../../models/user.model';
import { Papa } from 'ngx-papaparse';
import { TranslateService } from '@ngx-translate/core';
import { validateUserData, validateUserId } from '../../../modules/shared/utils/user.util'
import { UsersService } from '../../../services/users.service'

@Component({
  selector: 'oms-bulk-user-form-dialog',
  templateUrl: './bulk-user-from-dialog.component.html',
  styleUrls: ['./bulk-user-from-dialog.component.scss'],
})
export class BulkUserFormDialogComponent {
  public csvTableData: [string, string, string, string, string, string][] = [];
  public csvValidationMessages: string = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { usersInDraft: { userId: string }[] },
    private dialog: MatDialogRef<BulkUserFormDialogComponent>,
    private t$: TranslateService,
    private papa: Papa,
    private usersService: UsersService,
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

  async fileChangeListner(files?: File[]): Promise<void> {
    if (files === null || files === undefined || files.length < 1)
      throw Error(this.t$.instant('names.noFileSelected'));

    const roles = await this.usersService.roles().toPromise()

    const reader: FileReader = new FileReader();
    reader.onload = e => {
      const csv = reader.result as string;
      const results = this.papa.parse(csv, { header: false });

      if (((results?.data?.length ?? 0) < 1) || (results?.errors?.length > 0))
        throw Error(this.t$.instant('names.errorParsingCSVFile'));

      const rows = (results.data as any[]).slice(1, results.data.length);
      const validRowsBeforeCsvInnerCheck = rows.filter(r => validateUserData(this.data.usersInDraft, roles, r[0], r[1], r[2], r[3], r[4], r[5]))

      const validRows = validRowsBeforeCsvInnerCheck
        .filter((r, i) => validateUserId([...validRowsBeforeCsvInnerCheck.slice(0, i), ...validRowsBeforeCsvInnerCheck.slice(i + 1)].map(r => ({ userId: r[0] })), r[0]))

      this.csvValidationMessages
        = `${this.t$.instant('names.csvTotalMessage')} [${rows.length}] ${this.t$.instant('names.csvSuccessMessage')} [${validRows.length}] ${this.t$.instant('names.csvFailedMessage')} [${rows.length - validRows.length}]`
      this.csvTableData = validRows;
    };
    reader.readAsText(files[0]);
  }
}
