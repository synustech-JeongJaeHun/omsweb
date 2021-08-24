import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IRole } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { DialogService } from '../../../services/dialog.service';
import { SystemsService } from '../../../services/systems.service';
import { UsersService } from '../../../services/users.service';
import { LegendDialogComponent } from '../dialogs/legend-dialog.component';
import { LoginDialogComponent } from '../dialogs/login-dialog.component';
import { ProfileDialogComponent } from '../dialogs/profile-dialog.component';
import { AccountUtil } from '../utils/account.util';
import { MessagesService } from '../../../services/messages.service';

@Component({
  selector: 'oms-gnb-actions',
  templateUrl: './gnb-actions.component.html',
  styleUrls: ['./gnb-actions.component.scss'],
})
export class GnbActionsComponent implements OnInit, OnDestroy {
  private _legendDlg: MatDialogRef<LegendDialogComponent, any>;
  private _activeAi: boolean;
  private _roles: IRole[] = [];
  private destroy$ = new Subject<void>();

  get isAuthenticated() {
    return this.auth.isAuthenticated;
  }
  get user() {
    return this.auth.currentUser;
  }
  get activeAi(): boolean {
    return this._activeAi;
  }
  get roleName(): string {
    if (this.user.roles.length === 0) return '#';
    const role = this._roles.find((r) => r.id == this.user.roles[0]);
    return role ? ` (${role.name})` : '@';
  }

  constructor(
    private auth: AuthService,
    private dialog: MatDialog,
    private dialogSvc: DialogService,
    private t$: TranslateService,
    private systemSvc: SystemsService,
    private userSvc: UsersService,
    private messageSvc: MessagesService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.systemSvc.currentState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this._activeAi = res.aiMode;
      });
    this.userSvc.roles().subscribe((data) => (this._roles = data));
  }

  onLegend() {
    if (this._legendDlg && this._legendDlg.getState() === MatDialogState.OPEN) {
      this._legendDlg.close();
      return;
    }

    this._legendDlg = this.dialog.open(LegendDialogComponent, {
      width: '650px',
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: true,
    });
  }

  onLogin() {
    this.dialog.open(LoginDialogComponent, {
      width: '350px',
      hasBackdrop: true,
      disableClose: true,
    });
  }
  onLogout() {
    this.auth.logout();
  }
  onProfile() {
    this.dialog.open(ProfileDialogComponent, {
      width: '350px',
      hasBackdrop: true,
      disableClose: true,
    });
  }
  onChangeAI() {
    if (!AccountUtil.hasPermission(3, this.auth.currentUser)) return;
    const transParam = { name: 'AI Mode' };
    this.dialogSvc
      .confirm({
        title: this.t$.instant('names.changeConfirm', transParam),
        body: this.t$.instant('messages.changeConfirm', transParam),
      })
      .subscribe((ok) => {
        if (ok) {
          this.messageSvc.sendAIModeCommand({ action: 'ai_mode', mode: 'change' }).subscribe();
        }
      });
  }
}
