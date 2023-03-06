import {Injectable, Injector} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs/operators';
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpResponseStatus} from "@oms/models/enums";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private snackBar: MatSnackBar, private injector: Injector) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.auth.token;
    request = request.clone({
      setHeaders: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(request).pipe(
      tap(
        (_) => { },
        (err) => {
          if (err.status == HttpResponseStatus.Unauthorized) {
            this.handleUnauthorized();
          }
          else if(err.status == HttpResponseStatus.Disconnect) {
            const $t = this.injector.get<TranslateService>(TranslateService);
            this.snackBar.open($t.instant('errors.Disconnected'), null, {
              panelClass: ['error', 'server'],
            });
          }
          return throwError(err);
        }
      )
    );
  }

  private handleUnauthorized() { }
}
