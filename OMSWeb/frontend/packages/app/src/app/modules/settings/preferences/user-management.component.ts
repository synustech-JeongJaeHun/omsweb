import { Component, OnDestroy, OnInit } from '@angular/core'
import { NIL, v4 as uuid4 } from 'uuid'

import { UsersService } from '@oms/services/users.service'
import {IRole, ISimpleUser, IUserForm} from '../../../models/user.model'
import { BehaviorSubject, combineLatest, forkJoin, Observable } from 'rxjs'
import {
	MatDialog,
	MatDialogRef,
	MatDialogState,
} from '@angular/material/dialog'
import { RoleSettingDialogComponent } from '../dialogs/role-setting-dialog.component'
import { UserFormDialogComponent } from '../dialogs/user-form-dialog.component'
import { BulkUserFormDialogComponent } from '../dialogs/bulk-user-from-dialog.component'
import { map } from 'rxjs/operators'
import * as _ from 'lodash'

@Component({
	selector: 'oms-user-management',
	templateUrl: './user-management.component.html',
	styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit, OnDestroy {
	private _roleDlg: MatDialogRef<RoleSettingDialogComponent>
	private _userDlg: MatDialogRef<UserFormDialogComponent>
	private _bulkAddUserDlg: MatDialogRef<BulkUserFormDialogComponent>
	private _changedItems: IUserForm[] = []
	private _removeIds: string[] = []

	dataSource$: Observable<ISimpleUser[]>

	removeIds$ = new BehaviorSubject<string[]>([])

	roles$: Observable<IRole[]>
	selectedIds: string[] = []
	private userId: string;

	get canRemove(): boolean {
		return this.selectedIds.length > 0
	}

	get isUpdated(): boolean {
		return this._removeIds.length > 0 || this._changedItems.length > 0
	}

	constructor(private userSvc: UsersService, private dialog: MatDialog) {
		this.dataSource$ = combineLatest([
			this.userSvc.users(),
			this.removeIds$,
		]).pipe(map(([users, ids]) => users.filter((u) => !ids.includes(u.id))))

		this.roles$ = this.userSvc.roles()
		this.userId = this.userSvc.userInfo()?.id ?? NIL
	}
	ngOnDestroy(): void {
		this._roleDlg &&
			this._roleDlg.getState() === MatDialogState.OPEN &&
			this._roleDlg.close()

		this._userDlg &&
			this._userDlg.getState() === MatDialogState.OPEN &&
			this._userDlg.close()
	}

	ngOnInit(): void {}

	onRoleSetting() {
		this._roleDlg = this.dialog.open(RoleSettingDialogComponent, {
			width: '600px',
			maxHeight: '80vh',
			hasBackdrop: true,
			disableClose: true,
			closeOnNavigation: true,
		})
	}

	onBulkAddUser(grid) {
		this._bulkAddUserDlg = this.dialog.open(BulkUserFormDialogComponent, {
			maxHeight: '80vh',
			hasBackdrop: true,
			disableClose: true,
			closeOnNavigation: true,
			data: { usersInDraft: grid.instance.getDataSource()._items },
		})
		this._bulkAddUserDlg.afterClosed().subscribe(async (rows) => {
			const roles = await this.roles$.toPromise()
			if (Array.isArray(rows)) {
				const newUsers: IUserForm[] = rows.map((row) => ({
					id: uuid4(),
					isNew: true,
					userId: row[0],
					firstName: row[1],
					lastName: row[2],
					email: row[3],
					password: row[4],
					roles: [
						(
							roles.find((role) => role.name === row[5]) ??
							roles.find((role) => role.name === 'VIEWER')
						).id,
					],
				}))

				this._changedItems.push(...newUsers)
				newUsers.forEach((newUser) =>
					grid.instance
						.getDataSource()
						.store()
						.push([{ type: 'insert', data: newUser }]),
				)
			}
		})
	}

	onAddUser(grid) {
		this._userDlg = this.dialog.open(UserFormDialogComponent, {
			width: '350px',
			hasBackdrop: true,
			disableClose: true,
			closeOnNavigation: true,
			data: { usersInDraft: grid.instance.getDataSource()._items },
		})
		this._userDlg.afterClosed().subscribe((res) => {
			if (res) {
				res.id = uuid4()
				res.isNew = true
				res.roles = [res.roles]

				this._changedItems.push(res)
				grid.instance
					.getDataSource()
					.store()
					.push([{ type: 'insert', data: res }])
			}
		})
	}
	onRemoveUsers() {
		this.removeIds$.next(this.selectedIds)
		for (let selectedId of this.selectedIds) this._removeIds.push(selectedId)
		const canceled = this._changedItems
			.filter((u) => u.isNew && this.selectedIds.includes(u.id))
			.map((u) => u.id)
		if (canceled && canceled.length > 0) {
			this._removeIds = _.difference(this.selectedIds, canceled)
			this._changedItems = this._changedItems.filter(
				(u) => !canceled.includes(u.id),
			)
		}
		this.selectedIds = []
	}
	onUpdate(e) {
		// console.log('### on update row >>', e);
		const { data, key } = e
		if (this._changedItems.some((c) => c.id === key)) {
			let user = this._changedItems.find((u) => u.id === key)

			//user = data;
			user.id = data.id
			user.userId = data.userId
			user.firstName = data.firstName
			user.lastName = data.lastName
			user.email = data.email
			//user.password = data.password;
			user.password = data.password == undefined ? 'NO' : data.password
			//user.roles = data.roles;
			user.roles = Array.isArray(data.roles) ? data.roles : [data.roles]
			user.isNew = data.isNew == undefined ? false : data.isNew
		} else {
			//let user = data;
			const user: IUserForm = {
				id: data.id,
				userId: data.userId,
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				//password: data.password,
				password: data.password == undefined ? 'NO' : data.password,
				//roles: data.roles,
				roles: Array.isArray(data.roles) ? data.roles : [data.roles],
				isNew: data.isNew == undefined ? false : data.isNew,
			}

			this._changedItems.push(user)
		}
	}
	onSelectionChanged(e) {
		this.selectedIds = this.selectedIds.filter((x) => (x !== NIL && x !== this.userId))
	}
	onSave(grid) {
		//console.log('### save : remove ids >>>', this._removeIds);
		//console.log('### save : change items >>>', this._changedItems);
		const jobs: Observable<void>[] = []
		this._removeIds.length &&
			jobs.push(this.userSvc.deleteAccounts(this._removeIds))
		this._changedItems.length &&
			jobs.push(this.userSvc.saveAccounts(this._changedItems))

		jobs.length &&
			forkJoin(jobs).subscribe(() => {
				grid.instance
					.getDataSource()
					.items()
					.forEach((item) => (item.isNew = false))

				this._removeIds = []
				this._changedItems = []
				grid.instance.refresh()
			})
	}
	onRevert(grid) {
		this.selectedIds = []
		this._changedItems = []
		this.removeIds$.next([])
	}

	onEditingStart(event: any) {
		if (event.column.dataField==='roles' && event.data.id === NIL) {
			event.cancel = true
		}
	}
}
``