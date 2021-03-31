import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '@oms/utils/account.util';
import { UserPermissions } from '../../../models/enums';

@Component({
  selector: 'oms-gnb',
  templateUrl: './gnb.component.html',
  styleUrls: ['gnb.component.scss'],
})
export class GnbComponent implements OnInit {
  get showGnb(): boolean {
    return (
      this.auth.isAuthenticated &&
      AccountUtil.hasPermission(UserPermissions.gnb, this.auth.CurrentUser)
    );
  }

  constructor(private auth: AuthService) {}

  ngOnInit(): void {}
}
