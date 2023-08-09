import { Injectable } from '@angular/core';
import {
  CanDeactivate,
} from '@angular/router';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageUnloadGuard implements CanDeactivate<any> {

  canDeactivate(
    component: any
  ): boolean | Observable<boolean> | Promise<boolean> {
    return component?.pageLoaded;
  }

}
