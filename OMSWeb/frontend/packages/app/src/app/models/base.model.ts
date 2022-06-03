export interface IKeyValuePair<TK, TV> {
	key: TK
	value: TV
}

export interface IPaginatedResult<T> {
	total: number
	items: T[]
	filtered: number
}

export interface IPaginatedRequest {
	start: number
	length: number
	query: any
	order: any
}

export interface IDialogMessage<T> {
	body: string
	title?: string
	payload?: T
	style?:
		| 'info'
		| 'warn'
		| 'danger'
		| 'success'
		| 'primary'
		| 'secondary'
		| 'light'
		| 'dark'
}

export interface IConfirmMessage<T> extends IDialogMessage<T> {
	confirmText?: string
	declineText?: string
}
export interface IErrorMessage<T> extends IDialogMessage<T> {
	errorText?: string
}

export interface ITokenResult {
	token: string
}

export interface ISimpleResponse<T> {
	data: T
}

export interface ITokenStamp {
	nbf?: number
	exp?: number
	iat?: number
}

export interface IIdObject {
	id: number
}
