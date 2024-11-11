import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {SettingsDialogComponent} from "./dialogs/settings-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class SettingsDialogService {

	private dialogRef!: MatDialogRef<SettingsDialogComponent>;

	setDialogRef(dialogRef: MatDialogRef<SettingsDialogComponent>) {
		this.dialogRef = dialogRef;
	}

	closeDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}
}
