import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'oms-gnb-menus',
  templateUrl: './gnb-menus.component.html',
  styleUrls: ['./gnb-menus.component.scss'],
})
export class GnbMenusComponent implements OnInit, OnDestroy {
  parentRoute: string;

  private routing$: Subscription;

  constructor(private router: Router) {}
  ngOnDestroy(): void {
    this.routing$ && this.routing$.unsubscribe();
  }

  ngOnInit(): void {
    this.detectParentRoute();
    this.routing$ = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((val) => {
        this.detectParentRoute();
        // this.parentRoute = routeNames.find(r => this.router.isActive(r, false));
      });
  }

  private detectParentRoute() {
    const routeNames = [
      '/monitor',
      '/playback',
      '/histories',
      '/logs',
      '/settings',
    ];
    console.info(
      '#### parent route >>',
      this.router.isActive('/monitor', false)
    );
    this.parentRoute = routeNames.find((r) => this.router.isActive(r, false));
  }
}
