import { ErrorHandler, Injector, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CustomErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) { }

  handleError(resError: Error | HttpErrorResponse): void {
    if (resError instanceof HttpErrorResponse) {
      if (!navigator.onLine) {
        this.showMessage('No internet connection', 'client');
      } else {
        const $t = this.injector.get<TranslateService>(TranslateService);
        const { error } = resError;
        this.showMessage(
          typeof error === 'string'
            ? error
            : error.message || $t.instant(`errors.${error.code}`),
          'server'
        );
      }
    } else {
      this.showMessage(
        typeof resError === 'string' ? resError : resError.message,
        'client'
      );
    }
    console.warn(resError);
  }

  showMessage(message: string, scope: 'client' | 'server') {
    const snackbar = this.injector.get<MatSnackBar>(MatSnackBar);
    snackbar.open(message, null, {
      panelClass: ['error', scope],
    });
  }
}
