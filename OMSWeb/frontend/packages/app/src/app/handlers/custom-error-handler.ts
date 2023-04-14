import { ErrorHandler, Injector, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {DialogService} from "@oms/services/dialog.service";
import {HubService} from "@oms/services/hub.service";
import {SettingsService} from "@oms/services/settings.service";

@Injectable({
  providedIn: 'root',
})
export class CustomErrorHandler implements ErrorHandler {
  isOpenDialog: boolean = false
  isSilentSync: boolean = false
  constructor(private injector: Injector) {
    const settingSvc = this.injector.get<SettingsService>(SettingsService)
    settingSvc.serviceConfig.subscribe((x)=>{
      this.isSilentSync= x.isSilentSync
    })
  }

  handleError(resError: Error | HttpErrorResponse): void {
    const $t = this.injector.get<TranslateService>(TranslateService);
    if (resError instanceof HttpErrorResponse) {
      if (!navigator.onLine) {
        this.showMessage('No internet connection', 'client');
      } else {

        const { error } = resError;
        this.showMessage(
          typeof error === 'string'
            ? error
            : error.message || $t.instant(`errors.${error.code}`),
          'server'
        );
      }
    } else {

      if(!this.isOpenDialog){
        this.isOpenDialog = true
        const dialogSvc = this.injector.get<DialogService>(DialogService);
        const hubSvc = this.injector.get<HubService>(HubService);

        if(!this.isSilentSync){
          hubSvc.detachEvents();
          dialogSvc.success({
            title: $t.instant('messages.confirmTitle'),
            body: $t.instant('messages.reload-serve')})
            .subscribe((ok) => {
              if (ok) {
                window.location.reload()
              }
              this.isOpenDialog = false
            });
        }
        else{
          const sec = 3000;
          this.showSnackbar(
            $t.instant('messages.reload-page', {sec: sec/1000}),
            'client',
            sec
          )
          setTimeout(()=>{
            window.location.reload()
            this.isOpenDialog = false
          }, sec)
        }

      }
    }
    console.warn(resError);
  }

  showMessage(message: string, scope: 'client' | 'server') {
    const snackbar = this.injector.get<MatSnackBar>(MatSnackBar);
    snackbar.open(message, null, {
      panelClass: ['error', scope],
    });
  }

  showSnackbar(content, scope: 'client' | 'server',
               duration= 5000,
               vertical: 'top'|'bottom'= 'top',
               horizon: 'start' | 'center' | 'end' | 'left' | 'right' ='center') {
    const snackbar = this.injector.get<MatSnackBar>(MatSnackBar);
    snackbar.open(content, null, {
      panelClass: ['error', scope],
      duration,
      verticalPosition: vertical,
      horizontalPosition: horizon
    });
  }
}
