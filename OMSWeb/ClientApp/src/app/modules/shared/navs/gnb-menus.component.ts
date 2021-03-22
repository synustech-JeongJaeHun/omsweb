import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'oms-gnb-menus',
  templateUrl: './gnb-menus.component.html',
  styleUrls: ['./gnb-menus.component.scss'],
})
export class GnbMenusComponent implements OnInit {
  parentRoute: string;

  constructor(router: Router) {
    this.detectParentRoute(router);
  }

  ngOnInit(): void {}

  private detectParentRoute(router: Router) {
    const routeNames = ['/monitor', '/playback', '/histories', '/logs', '/settings']
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((val) => {
        this.parentRoute = routeNames.find(r => router.isActive(r, false));
      });
  }
}
